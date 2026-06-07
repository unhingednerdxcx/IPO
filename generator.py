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
def get_xp():
    total = 0
    res = []
    bfr_res = [0, 0, 0, 0, 0, 0, 0, 0, 10]
    for i in range(len(bfr_res) -2):
        multiplier = round(0.2 + random.random() * 2, 1)
        adder = bfr_res[len(bfr_res) - 1] * multiplier
        completed = True
        val = 0
        val = bfr_res[i] + adder
        while completed:
            if val > 15:
                val = val - 1 + random.random() * 2
            else:
                completed = False
                val = round(val)
                res.append(val)
                total += val
    return res
    

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
xp = get_xp()
print(challanges)
db.collection("Tasks").document("Tasks").update({
    "Tasks": challanges,
    "XP": xp
}, timeout=1200)
print("PASSCODE GOTTEN")

