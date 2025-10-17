"""
User service for managing users with dual-database sync
All queries use parameterized statements to prevent SQL injection
"""
import logging
from typing import Optional, Dict, Any
from datetime import datetime
from database import execute_query, get_db_cursor
from auth import get_password_hash, verify_password

logger = logging.getLogger(__name__)


class UserService:
    """Service for user management with Dell server sync"""

    @staticmethod
    def create_user(
        email: str,
        name: str,
        password: str = None,
        oauth_provider: str = None,
        oauth_provider_id: str = None,
        oauth_access_token: str = None,
        picture_url: str = None,
        **profile_data
    ) -> Dict[str, Any]:
        """
        Create user in local DB and sync to Dell server
        Uses parameterized queries to prevent SQL injection
        """
        try:
            # Hash password if provided
            password_hash = get_password_hash(password) if password else None

            # Insert into local database with parameterized query
            local_query = """
                INSERT INTO users (
                    email, name, password_hash, oauth_provider, oauth_provider_id,
                    oauth_access_token, picture_url, email_verified, created_at
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW())
                RETURNING id, email, name, created_at
            """

            email_verified = oauth_provider == 'google'  # Auto-verify Google emails

            result = execute_query(
                local_query,
                (email, name, password_hash, oauth_provider, oauth_provider_id,
                 oauth_access_token, picture_url, email_verified),
                use_dell_server=False
            )

            if not result:
                raise Exception("Failed to create user in local database")

            local_user_id, user_email, user_name, created_at = result[0]
            logger.info(f"Created local user: {user_email} (ID: {local_user_id})")

            # Sync to Dell server
            dell_user_id = UserService._sync_to_dell_server(
                local_user_id, email, name, password_hash, profile_data
            )

            # Update local user with Dell ID
            if dell_user_id:
                update_query = """
                    UPDATE users
                    SET dell_server_user_id = %s, last_synced_at = NOW()
                    WHERE id = %s
                """
                execute_query(update_query, (dell_user_id, local_user_id), fetch=False)

            return {
                "id": local_user_id,
                "email": user_email,
                "name": user_name,
                "dell_server_user_id": dell_user_id,
                "created_at": created_at
            }

        except Exception as e:
            logger.error(f"Error creating user: {e}")
            raise

    @staticmethod
    def _sync_to_dell_server(
        local_user_id: int,
        email: str,
        name: str,
        password_hash: str = None,
        profile_data: Dict = None
    ) -> Optional[int]:
        """Sync user to Dell server database (if available)"""
        try:
            # Check if Dell server is available
            dell_query = """
                INSERT INTO users_personalized (
                    email, name, password_hash, created_at
                )
                VALUES (%s, %s, %s, NOW())
                RETURNING id
            """

            result = execute_query(
                dell_query,
                (email, name, password_hash),
                use_dell_server=True
            )

            if result:
                dell_id = result[0][0]
                logger.info(f"Synced user {email} to Dell server (ID: {dell_id})")
                return dell_id

        except Exception as e:
            logger.warning(f"Could not sync to Dell server: {e}")
            # Continue without Dell sync - graceful degradation
            return None

    @staticmethod
    def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
        """Get user by email using parameterized query"""
        query = """
            SELECT id, email, name, password_hash, oauth_provider, oauth_provider_id,
                   picture_url, email_verified, is_active, dell_server_user_id,
                   primary_interests, secondary_interests, created_at
            FROM users
            WHERE email = %s AND is_active = TRUE
        """

        result = execute_query(query, (email,), use_dell_server=False)

        if result:
            row = result[0]
            return {
                "id": row[0],
                "email": row[1],
                "name": row[2],
                "password_hash": row[3],
                "oauth_provider": row[4],
                "oauth_provider_id": row[5],
                "picture_url": row[6],
                "email_verified": row[7],
                "is_active": row[8],
                "dell_server_user_id": row[9],
                "primary_interests": row[10],
                "secondary_interests": row[11],
                "created_at": row[12]
            }

        return None

    @staticmethod
    def get_user_by_oauth(provider: str, provider_id: str) -> Optional[Dict[str, Any]]:
        """Get user by OAuth provider and ID using parameterized query"""
        query = """
            SELECT id, email, name, password_hash, oauth_provider, oauth_provider_id,
                   picture_url, email_verified, is_active, dell_server_user_id
            FROM users
            WHERE oauth_provider = %s AND oauth_provider_id = %s AND is_active = TRUE
        """

        result = execute_query(query, (provider, provider_id), use_dell_server=False)

        if result:
            row = result[0]
            return {
                "id": row[0],
                "email": row[1],
                "name": row[2],
                "password_hash": row[3],
                "oauth_provider": row[4],
                "oauth_provider_id": row[5],
                "picture_url": row[6],
                "email_verified": row[7],
                "is_active": row[8],
                "dell_server_user_id": row[9]
            }

        return None

    @staticmethod
    def verify_credentials(email: str, password: str) -> Optional[Dict[str, Any]]:
        """Verify user credentials"""
        user = UserService.get_user_by_email(email)

        if not user:
            return None

        if not user['password_hash']:
            # OAuth-only user
            return None

        if not verify_password(password, user['password_hash']):
            return None

        # Update last login
        update_query = "UPDATE users SET last_login_at = NOW() WHERE id = %s"
        execute_query(update_query, (user['id'],), fetch=False)

        return user

    @staticmethod
    def update_profile(user_id: int, profile_data: Dict[str, Any]) -> bool:
        """
        Update user profile with parameterized query
        Also syncs to Dell server
        """
        try:
            # Build update query dynamically but safely
            allowed_fields = {
                'name', 'age_range', 'education_level', 'field_of_study',
                'primary_interests', 'secondary_interests', 'hobbies',
                'topics_to_avoid', 'preferred_complexity', 'preferred_article_length',
                'news_frequency', 'preferred_content_types', 'political_orientation',
                'credibility_threshold'
            }

            # Filter to only allowed fields
            update_fields = {k: v for k, v in profile_data.items() if k in allowed_fields}

            if not update_fields:
                return True

            # Build SET clause with placeholders
            set_clause = ", ".join([f"{field} = %s" for field in update_fields.keys()])
            values = list(update_fields.values())
            values.append(user_id)  # For WHERE clause

            query = f"""
                UPDATE users
                SET {set_clause}, updated_at = NOW()
                WHERE id = %s
            """

            execute_query(query, tuple(values), fetch=False)
            logger.info(f"Updated profile for user {user_id}")

            # Sync to Dell server if available
            UserService._sync_profile_to_dell(user_id, update_fields)

            return True

        except Exception as e:
            logger.error(f"Error updating profile: {e}")
            return False

    @staticmethod
    def _sync_profile_to_dell(user_id: int, profile_data: Dict[str, Any]):
        """Sync profile updates to Dell server"""
        try:
            # Get Dell server user ID
            query = "SELECT dell_server_user_id FROM users WHERE id = %s"
            result = execute_query(query, (user_id,), use_dell_server=False)

            if not result or not result[0][0]:
                return

            dell_user_id = result[0][0]

            # Update on Dell server (with fewer fields)
            dell_fields = {
                'name', 'age_range', 'education_level', 'primary_interests',
                'secondary_interests', 'political_orientation', 'credibility_threshold'
            }

            update_fields = {k: v for k, v in profile_data.items() if k in dell_fields}

            if not update_fields:
                return

            set_clause = ", ".join([f"{field} = %s" for field in update_fields.keys()])
            values = list(update_fields.values())
            values.append(dell_user_id)

            dell_query = f"""
                UPDATE users_personalized
                SET {set_clause}
                WHERE id = %s
            """

            execute_query(dell_query, tuple(values), use_dell_server=True, fetch=False)
            logger.info(f"Synced profile to Dell server for user {user_id}")

        except Exception as e:
            logger.warning(f"Could not sync profile to Dell server: {e}")
