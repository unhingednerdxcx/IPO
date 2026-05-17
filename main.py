import eel
import os

FOLDER = os.path.dirname(os.path.abspath(__file__))
WFOLDER = os.path.join(FOLDER, "web")
LOGFILE = os.path.join(FOLDER, "log.txt")
eel.init(WFOLDER)
def log(msg):
    with open(LOGFILE, 'a') as f:
        f.write(f"- {msg}\n")

@eel.expose
def listTask(catagory=""):
    log(f"Listing task {catagory}..")

@eel.expose
def addTask(name, catagory, date):
    log("Making new task {name}, {catagory}, {date}..")

@eel.expose
def searchTask(name):
    log("Searching for a new task {name}..")

@eel.expose
def addNewGroup(name):
    log("Making new group {name}..")
eel.start('index.html', port=8000)