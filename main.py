import eel
import os
import json

FOLDER = os.path.dirname(os.path.abspath(__file__))
WFOLDER = os.path.join(FOLDER, "web")
LOGFILE = os.path.join(FOLDER, "log.txt")
TASKFILE = os.path.join(FOLDER, "data", "tasks.json")
eel.init(WFOLDER)
def log(msg):
    with open(LOGFILE, 'a') as f:
        f.write(f"- {msg}\n")

def TaskManager(mode, val=""):
    match mode:
        case "r":
            with open(TASKFILE, 'r') as file:
                return json.load(file)
        case "w":
            with open(TASKFILE, 'w') as file:
                json.dump(val, file, indent=4)

@eel.expose
def listTask(catagory="", subcatagory=""):
    log(f"Listing task {catagory}..")
    data = TaskManager('r')
    log(f"{data}")
    for loopCat, val in data.items():
        if loopCat == catagory:
            log(data[loopCat].items())
            log(data[loopCat])
            for loopSubCat, val in data[loopCat].items():
                if loopSubCat == subcatagory:
                    return val


@eel.expose
def addTask(name="", catagory="", subcatagory="", date=""):
    log(f"Making new task {name}, {catagory}, {subcatagory} {date}..")
    data = TaskManager('r')
    data.setdefault(catagory, {}).setdefault(subcatagory, {})
    data[catagory][subcatagory].update({
        name: {
            "date": date
        }
    })
    TaskManager('w', data)

@eel.expose
def searchTask(name):
    log("Searching for a new task {name}..")

@eel.expose
def addNewGroup(name):
    log("Making new group {name}..")
eel.start('index.html', port=8000)