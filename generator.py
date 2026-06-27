import os
import firebase_admin
from firebase_admin import firestore
from google.cloud.firestore import ArrayUnion
import json
import random
task_list = os.environ.get('TASKLIST') # get the task list (stored in json format)
def get_challanges():
    print(task_list)
    tasks = json.loads( # Load the json
        task_list
    )
    # Basically, we are generating a random index (0 to 9) from each catagory
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
    res = []  # this is the result xp collection
    bfr_res = [0, 0, 0, 0, 0, 0, 0, 0, 10] # this is just buffer array for result

    for i in range(len(bfr_res) -2): # -2 because the buffer has 2 more index than needed
        multiplier = round(0.2 + random.random() * 2, 1) # we will get a random multipler that is betweeen 0.2 and 2.2 and is rounded to 1 d.p.
        adder = bfr_res[len(bfr_res) - 1] * multiplier  # get the last index multiply that by 10
        completed = True
        val = bfr_res[i] + adder # add to the index
        while completed:
            if val > 15: # if its more than 15
                val = val - 1 + random.random() * 2  # increment with the new value
            else:
                completed = False # completed 
                val = round(val) # round
                res.append(val) # add to result
    return res
    

password = os.environ.get('SUPER_KEY') # get the service-account.json
if not password: # if the environment variable dosen't exist
    print("NO PASSWORD (p.s if you are running this and you are not admin, dont run this script, its just for admins)")
    exit(1) # stop the code with error
print("PASSCODE GOTTEN")
account = json.loads(
    password
)
credentials = firebase_admin.credentials.Certificate(account)
firebase_admin.initialize_app(credentials) # verify
db = firestore.client()
challanges = get_challanges() # get random challanges
xp = get_xp() # get random challanges
print(challanges)
db.collection("Tasks").document("Tasks").update({
    "Tasks": challanges,
    "XP": xp
}, timeout=1200)
print("CODE COPLETE")

