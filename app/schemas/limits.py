"""Centralized validation limits shared across schema modules."""

# Phone numbers are stored in the database as VARCHAR(9).
PHONE_DIGITS = 9

# Account-related limits
ACCOUNT_FULL_NAME_MIN = 2
ACCOUNT_FULL_NAME_MAX = 150
ACCOUNT_CITY_MIN = 2
ACCOUNT_CITY_MAX = 120

# Password policy shared by accounts and legacy users
PASSWORD_MIN_LENGTH = 8
PASSWORD_MAX_LENGTH = 128

# Report payload limits
REPORT_FULL_NAME_MIN = 2
REPORT_FULL_NAME_MAX = 150
REPORT_ADDRESS_MIN = 5
REPORT_ADDRESS_MAX = 250
REPORT_CITY_MIN = 2
REPORT_CITY_MAX = 120
REPORT_PROBLEM_MIN = 5
REPORT_PROBLEM_MAX = 1500
REPORT_DETAILS_MAX = 4000

# Report type descriptions are displayed in UI tooltips
REPORT_TYPE_NAME_MIN = 2
REPORT_TYPE_NAME_MAX = 100
REPORT_TYPE_DESCRIPTION_MAX = 1000

# Legacy user module limits (still used by a few admin endpoints)
USER_USERNAME_MIN = 3
USER_USERNAME_MAX = 50
