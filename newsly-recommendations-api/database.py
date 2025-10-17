"""Database connection management with connection pooling"""
import psycopg2
from psycopg2 import pool
from contextlib import contextmanager
from config import settings
import logging

logger = logging.getLogger(__name__)

# Connection pools for both databases
local_connection_pool = None
dell_connection_pool = None


def init_connection_pools():
    """Initialize connection pools for both databases"""
    global local_connection_pool, dell_connection_pool

    try:
        # Local database pool
        local_connection_pool = psycopg2.pool.ThreadedConnectionPool(
            minconn=2,
            maxconn=20,
            host=settings.DATABASE_HOST,
            port=settings.DATABASE_PORT,
            database=settings.DATABASE_NAME,
            user=settings.DATABASE_USER,
            password=settings.DATABASE_PASSWORD
        )
        logger.info("Local database connection pool initialized")

        # Dell server database pool (via reverse SSH) - optional
        try:
            dell_connection_pool = psycopg2.pool.ThreadedConnectionPool(
                minconn=1,
                maxconn=10,
                host=settings.DELL_SERVER_DB_HOST,
                port=settings.DELL_SERVER_DB_PORT,
                database=settings.DELL_SERVER_DB_NAME,
                user=settings.DELL_SERVER_DB_USER,
                password=settings.DELL_SERVER_DB_PASSWORD
            )
            logger.info("Dell server database connection pool initialized")
        except Exception as e:
            logger.warning(f"Dell server database connection failed (will retry on demand): {e}")
            dell_connection_pool = None

    except Exception as e:
        logger.error(f"Error initializing local connection pool: {e}")
        raise


def close_connection_pools():
    """Close all connection pools"""
    global local_connection_pool, dell_connection_pool

    if local_connection_pool:
        local_connection_pool.closeall()
        logger.info("Local connection pool closed")

    if dell_connection_pool:
        dell_connection_pool.closeall()
        logger.info("Dell connection pool closed")


@contextmanager
def get_db_connection(use_dell_server=False):
    """
    Context manager for database connections with automatic cleanup

    Args:
        use_dell_server: If True, connect to Dell server database
    """
    pool_to_use = dell_connection_pool if use_dell_server else local_connection_pool

    if use_dell_server and pool_to_use is None:
        raise Exception("Dell server database connection not available. Please check SSH tunnel.")

    conn = None

    try:
        conn = pool_to_use.getconn()
        yield conn
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Database error: {e}")
        raise
    finally:
        if conn:
            pool_to_use.putconn(conn)


@contextmanager
def get_db_cursor(use_dell_server=False, commit=True):
    """
    Context manager for database cursor with automatic commit/rollback

    Args:
        use_dell_server: If True, connect to Dell server database
        commit: If True, commit transaction on success
    """
    with get_db_connection(use_dell_server) as conn:
        cursor = conn.cursor()
        try:
            yield cursor
            if commit:
                conn.commit()
        except Exception as e:
            conn.rollback()
            logger.error(f"Cursor error: {e}")
            raise
        finally:
            cursor.close()


def execute_query(query: str, params: tuple = None, use_dell_server=False, fetch=True):
    """
    Execute a database query

    Args:
        query: SQL query string
        params: Query parameters
        use_dell_server: If True, execute on Dell server database
        fetch: If True, fetch and return results

    Returns:
        Query results if fetch=True, otherwise None
    """
    with get_db_cursor(use_dell_server) as cursor:
        cursor.execute(query, params)
        if fetch:
            return cursor.fetchall()
        return None


def execute_many(query: str, params_list: list, use_dell_server=False):
    """
    Execute multiple queries efficiently

    Args:
        query: SQL query string
        params_list: List of parameter tuples
        use_dell_server: If True, execute on Dell server database
    """
    with get_db_cursor(use_dell_server) as cursor:
        cursor.executemany(query, params_list)
