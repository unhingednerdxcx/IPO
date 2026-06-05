import os
import firebase_admin
from firebase_admin import firestore
from google.cloud.firestore import ArrayUnion
import json
import random
task_list = os.environ.get('TASKLIST')
def get_challanges():
    print(task_list)
    tasks = json.loads(
        task_list
    )
    return [
        tasks['WasteCleanup'][random.randint(0, 9)],
        tasks['RecyclingAndWaste'][random.randint(0, 9)],
        tasks['EnergySaving'][random.randint(0, 9)],
        tasks['WaterConservation'][random.randint(0, 9)],
        tasks['SustainableTransport'][random.randint(0, 9)],
        tasks['NatureRestoration'][random.randint(0, 9)],
        tasks['CommunityAndAwareness'][random.randint(0, 9)],
    ]

password = os.environ.get('SUPER_KEY')
if not password:
    print("NO PASSWORD (p.s if you are running this and you are not admin, dont run this script, its just for admins)")
    exit(1)
print("PASSCODE GOTTEN")
account = json.loads(
    password
)
credentials = firebase_admin.credentials.Certificate(account)
firebase_admin.initialize_app(credentials)
db = firestore.client()
challanges = get_challanges()
print(challanges)
db.collection("Tasks").document("Tasks").update({
    "Tasks": ["new_task", "sad", "electric"]
}, timeout=1200)
print("PASSCODE GOTTEN")

