import os

def main():
    password = os.environ.get('SECRET_KEY')
    if not password:
        print("NO PASSWORD (p.s if you are running this and you are not admin, dont run this script, its just for admins)")
        exit(1)
    print("PASSCODE GOTTEN")