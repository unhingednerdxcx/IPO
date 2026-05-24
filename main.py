import eel
import os
import json
from rapidfuzz import process
import time
from datetime import datetime


FOLDER = os.path.dirname(os.path.abspath(__file__))
WFOLDER = os.path.join(FOLDER, "web")
LOGFILE = os.path.join(FOLDER, "log.txt")
TASKFILE = os.path.join(FOLDER, "data", "tasks.json")
eel.init(WFOLDER)


def log(msg):
    with open(LOGFILE, 'a') as f:
        f.write(f"- {msg}\n")

@eel.expose
def TaskManager(mode, val="", req=""):
    match mode:
        case "r":
            with open(TASKFILE, 'r') as file:
                val = json.load(file)
                if req == "arr":
                    return list(val)
                return val
        case "w":
            with open(TASKFILE, 'w') as file:
                json.dump(val, file, indent=4)

@eel.expose
def listTask(catagory="", subcatagory="", op=""):
    log(f"Listing task {catagory}..")
    data = TaskManager('r')
    log(f"{data}")
    if op != "":
        if op == "today":
            now = datetime.now()
            formated = "/".join([
                str(now.year),
                str(now.month),
                str(now.day),
                str(now.hour),
                str(now.minute)
            ])
            print(formated)
            values = listAllTasksDate()
    for loopCat, val in data.items():

        if loopCat == catagory:

            log(data[loopCat].items())
            log(data[loopCat])

            for loopSubCat, val in data[loopCat].items():
                if loopSubCat == subcatagory:
                    return list(val)


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
    res_dict = []
    data = TaskManager('r')
    taskArr = []
    taskMap = []
    c = data
    i = 0
    for catagory, subcat in data.items():
        for sub, tasks in subcat.items():
            for task in list(tasks.keys()):
                taskArr.append(task)
                taskMap.append(f"{catagory}/{list(subcat.keys())[i]}/{task}")
            i += 1
        i = 0
    for i in range(0, len(taskArr)):
        print(taskArr[i])
    matches = process.extract(name, taskArr, limit=4)
    for match, score, index in matches:
        res_dict.append({
            "name": match,
            "map": taskMap[index]
        })
    print(res_dict)
    return res_dict

@eel.expose
def addNewGroup(name):
    log("Making new group {name}..")
    data = TaskManager('r')
    data[name] = {}
    TaskManager('w', data)

@eel.expose
def newSubGroup(catagory, sub):
    log("Making new subgroup {catagory}..")
    data = TaskManager('r')
    data.setdefault(catagory, {})
    data[catagory].update({
        sub: {}
    })
    TaskManager('w', data)

@eel.expose
def listAllSubGrp(catagory):
    res_arr = []
    data = TaskManager('r')
    for grp, subgrp in data.items():
        for i in range(0, len(list(subgrp.keys())) ):
            res_arr.append(list(subgrp.keys())[i])
    print(res_arr)
    return res_arr

@eel.expose
def listGroupDict():
    data = TaskManager('r')
    data = {
        key: list(value.keys())
        for key, value in data.items()
    }
    return data

def listAllTasksDate():
    res_arr = [[], []]
    data = TaskManager('r')
    for cat, subcat in data.items():
        for subcatt, task in subcat.items():
            for taskt, date in task.items():
                res_arr[0].append(taskt)
                res_arr[1].append(date['date'])
    return res_arr
eel.start('index.html', port=0)