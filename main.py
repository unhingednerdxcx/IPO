import eel
import os
import json
from rapidfuzz import process
import time
from datetime import datetime
from datetime import date as datetime_date
from datetime import timezone
import sys

FOLDER = os.path.dirname(os.path.abspath(__file__))
WFOLDER = os.path.join(FOLDER, "web")
LOGFILE = os.path.join(FOLDER, "log.txt")
TASKFILE = os.path.join(FOLDER, "data", "tasks.json")
ROUTINEFILE =  os.path.join(FOLDER, "data", "routine.json")
SETTINGFILE = os.path.join(FOLDER, "data", "settings.json")
eel.init(WFOLDER)

@eel.expose
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

def RoutineManager(mode, val="", req=""):
    match mode:
        case "r":
            with open(ROUTINEFILE, 'r') as file:
                val = json.load(file)
                if req == "arr":
                    return list(val)
                return val
        case "w":
            with open(ROUTINEFILE, 'w') as file:
                json.dump(val, file, indent=4)

def settingsManager(mode, val="", req=""):
    match mode:
        case "r":
            with open(SETTINGFILE, 'r') as file:
                val = json.load(file)
                if req == "arr":
                    return list(val)
                return val
        case "w":
            with open(SETTINGFILE, 'w') as file:
                json.dump(val, file, indent=4)

@eel.expose
def listTask(catagory="", subcatagory="", op=""):
    log(f"Listing task {catagory}..")
    data = TaskManager('r')
    log(f"{data}")
    if op != "":
        if op == "today":
            res = []
            now = datetime.now()
            formated = "/".join([
                str(now.year),
                str(now.month),
                str(now.day),
                str(now.hour),
                str(now.minute)
            ])
            values = listAllTasksDate()
            key = 0
            for date in values[1]:
                date_arr = date.split('/')
                if int(date_arr[0]) == now.year and int(date_arr[1]) == now.month and int(date_arr[2]) == now.day:
                    print(key)
                    selected = (values[0][key].split("\\"), values[1][key].split("\\"))
                    print(selected)
                    res.append(selected[0])
                key += 1
            print(res)
            return res

        if op == "upcomming":
            res = []
            now = datetime.now()
            formated = "/".join([
                str(now.year),
                str(now.month),
                str(now.day),
                str(now.hour),
                str(now.minute)
            ])
            values = listAllTasksDate()
            key = 0
            for date in values[1]:
                date_arr = date.split('/')
                if not(int(date_arr[0]) == now.year and int(date_arr[1]) == now.month and int(date_arr[2]) == now.day):
                    print(key)
                    selected = (values[0][key].split("\\"), values[1][key].split("\\"))
                    res.append(selected[0])
                key += 1
            print(res)
            return res
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
            "date": date,
            "done": False
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
    res_arr = [[], [], []]
    data = TaskManager('r')
    for cat, subcat in data.items():
        for subcatt, task in subcat.items():
            for taskt, info in task.items():
                res_arr[0].append(f"{taskt}\\{cat}/{subcatt}")
                res_arr[1].append(info['date'])
                res_arr[2].append(info["done"])
    return res_arr

@eel.expose
def listCatItems(cat, subcat):
    data = TaskManager('r')
    print(list(data[cat][subcat]))
    return list(data[cat][subcat])

@eel.expose
def toggletask(path, setto):
    path_arr = path.split('/')
    data = TaskManager('r')
    print(path_arr)
    data[path_arr[0]][path_arr[1]][path_arr[2]]['done'] = setto
    print("DATA:", data[path_arr[0]][path_arr[1]][path_arr[2]]['done'])
    TaskManager('w', data)

@eel.expose
def donestatus(path):
    path_arr = path.split('/')
    data = TaskManager('r')
    return data[path_arr[0]][path_arr[1]][path_arr[2]]['done']

@eel.expose
def listAllRoutineNames():
    data = RoutineManager('r')
    res_arr = []
    for time in data:
        for routineName in data[time]:
            res_arr.append([time, list(routineName)[0]])
    print(res_arr)
    return res_arr

@eel.expose
def listRoutineTraits(time, routineName):
    data = RoutineManager('r')
    if data[time]:
        for testRoutineName in data[time]:
            print(list(testRoutineName)[0])
            if list(testRoutineName)[0] == routineName:
                return testRoutineName[next(iter(testRoutineName))]

@eel.expose
def validateDateTime(fullIso):
    target = datetime.fromisoformat(fullIso)
    now = datetime.now(timezone.utc)
    if (target < now):
        return False
    return True

@eel.expose
def addRoutine(time, name):
    log("SUDDEND_ROUTINE")
    data = RoutineManager('r')
    data = dict(data)
    data[time.lower()].append({
        name: {
            "tasks": [],
            "Complete till": '',
            "Streak": 0,
            "Most difficult": {
                "name": "",
                "score": 0
            },
            "Most easiest": {
                "name": "",
                "score": 0
            },
            "stops": [],
            "consistancy": [
                0, 0, 0, 0, 0, 0, 0
            ]
        }
    })
    RoutineManager('w', data)

@eel.expose
def setComplete(path):
    arr = path.split('/')
    data = RoutineManager('r')
    print(arr)
    data[arr[0]][int(arr[1])][arr[3]]["Complete till"] = arr[2]

    RoutineManager('w', data)

@eel.expose
def loggedin():
    data = settingsManager('r')
    return data["AccMade"]

@eel.expose
def setloggedin():
    data = settingsManager('r')
    data["AccMade"] = True
    settingsManager('w', data)

@eel.expose
def getColors():
    data = settingsManager('r')
    colorTheme = data['colors'][data['color']]
    return colorTheme

@eel.expose
def changeColor(color):
    data = settingsManager('r')
    data['color'] = color
    settingsManager('w', data)

@eel.expose
def CleanUp():
    data = TaskManager('r')
    now = datetime.now()
    formated = "/".join([
        str(now.year),
        str(now.month),
        str(now.day),
        str(now.hour),
        str(now.minute)
    ])
    values = listAllTasksDate()
    key = 0
    new_data = data
    for date in values[1]:
        date_arr = date.split('/')
        target_date = datetime_date(int(date_arr[0]), int(date_arr[1]), int(date_arr[2]))
        if target_date < now.date():
            taskname = values[0][key].split('\\')[0]
            taskpath = values[0][key].split('\\')[1].split('/')
            print(taskname, taskpath)
            del new_data[taskpath[0]][taskpath[1]][taskname]
        key += 1
    print(new_data)
    TaskManager('w', new_data)
    time.sleep(1)
    sys.exit()

def exitCode(page_route, remaining_websockets):
    if not remaining_websockets:
        CleanUp()

@eel.expose
def make3d(info, completed):
    val = [
        [info["Tasks"][index], info["XP"][index], value] for index, value in enumerate(completed)
    ]
    print(val)
    return val


eel.start('index.html', port=55555, close_callback=exitCode)

