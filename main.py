
"""
    Reading the README specifically section: [x] is highly recomendable for
    context
"""

### IMPORTS ###
import eel # eel will basically provide a web server for my app to run on, additionally it acts as an RPC-style bridge between JS(converted from TS) and python
# Remember RPC = sharing functions, IPC = sharing data
import os # OS provides a clearer cross-platform way to do things (For example with paths, c:\user\... vs ~/...)
import json # json allows me to eaily manupilate json files (used to store data even after program is terminated)
from rapidfuzz import process # for search options, it checks the best possible pattern like if i'm searching for fruits, and i type 'ap', 
#                               rapidfuzz returns 'apple' (assuming its the most similiar pattern to 'ap')

import time # This library provides functions to manupilate time
from datetime import datetime
from datetime import date as datetime_date # to avoid variable name collision, i chose the to import it as datetime_date
from datetime import timezone, timedelta # to compare with days 
from dateutil.relativedelta import relativedelta # to compare with month (1 month = 28/29/30/31 days)
"""
    type      = meaning
    datetime  = date + time
    date      = date
"""

import sys # i only used this library to close the app
import pandas # pandas allows me to do complex data processing using only a few statements

# Storing paths
FOLDER = os.path.dirname(os.path.abspath(__file__)) # Find the correct paths dirname (for example if path is:-
#        C:\User\really_cool_user\Downloads\IPO -GUI based\main.py, it will only extract 
#        C:\User\really_cool_user\Downloads\IPO -GUI based)
WFOLDER = os.path.join(FOLDER, "web")
LOGFILE = os.path.join(FOLDER, "log.txt")
TASKFILE = os.path.join(FOLDER, "data", "tasks.json")
ROUTINEFILE =  os.path.join(FOLDER, "data", "routine.json")
SETTINGFILE = os.path.join(FOLDER, "data", "settings.json")
eel.init(WFOLDER) # this tells eel where my frontend files are

"""
    ## THE DECORATORS (the @) ##

    @eel.expose
    def add(num1, num2):
        return num1 + num2

    is the same as

    def add(num1, num2):
        return num1 + num2

    add = eel.expose(add)

    but i prefer the decorator as its more concise and more readable
"""

@eel.expose
def log(msg):
    with open(LOGFILE, 'a') as f:
        f.write(f"- {msg}\n")

# JSON HANDLERS #

def TaskManager(mode, val="", req=""):
    match mode: # match is a python 3.10 function, its the same as switch/case or if/elif/else
        case "r":
            with open(TASKFILE, 'r') as file: # with ensures even if something breaks, the file wll properly close (meaning 
#                                               there wont be random open files)
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

# normal functions #

@eel.expose
def listTask(catagory="", subcatagory="", op=""):
    log(f"Listing task {catagory}..") # f-strings are used to make strings look better (NO difference between (",,", var) and (f".. {var}") )
    data = TaskManager('r')
    log(f"{data}")
    if op != "": # if an option was provided
        if op == "today": 
            res = [] # the array we will  populate with our results
            now = datetime.now()
            values = listAllTasksDate()
            key = 0 # to track index (will use enumarate later [x])
            for date in values[1]:
                print(date)
                date_arr = date.split('/') # get individual date times like year, month, day
                if int(date_arr[0]) == now.year and int(date_arr[1]) == now.month and int(date_arr[2]) == now.day: # check if the date is today
                    print(key)
                    selected = (values[0][key].split("/")[2], values[0][key]) # format the data
                    print(selected)
                    res.append(selected) # apppend the format to the result array 
                key += 1 # increment the index
            print(res)
            return res # return the result back to JS/TS

        if op == "upcomming":
            res = []
            now = datetime.now()
            values = listAllTasksDate()
            key = 0
            for date in values[1]:
                date_arr = date.split('/')
                if not(int(date_arr[0]) == now.year and int(date_arr[1]) == now.month and int(date_arr[2]) == now.day): # check if its NOT today
                    print(key)
                    selected = (values[0][key].split("/")[2], values[0][key])
                    res.append(selected)
                key += 1
            print(res)
            return res
    # the following steps will happen if NO option was provided
    for loopCat, val in data.items():

        if loopCat == catagory: # if we got the catagory correct,

            log(data[loopCat].items())
            log(data[loopCat])

            for loopSubCat, val in data[loopCat].items():
                if loopSubCat == subcatagory: # if the subcatagory is correct,
                    return list(val) # we will retrun the contents


@eel.expose
def addTask(name="", catagory="", subcatagory="", date=""):
    log(f"Making new task {name}, {catagory}, {subcatagory} {date}..")
    data = TaskManager('r') 
    data.setdefault(catagory, {}).setdefault(subcatagory, {}) # This ensures the subcatagory exists (if it doesent, it will make it and store {})
    data[catagory][subcatagory].update({ # update is to add, = means to rewrite
        name: {
            "date": date,
            "done": False
        }
    })
    TaskManager('w', data)

@eel.expose
def searchTask(name):
    log("Searching for a new task {name}..")
    data = TaskManager('r')
    taskArr = [] # this will store the top 4 most similar names based on the input provided
    taskMap = [] # this will store the top 4 most similar name's paths
    res_dict = {} # this will store the top 4 most similar names based on the input provided AND their paths
    for catagory, subcat in data.items():
        for sub, tasks in subcat.items():
            i = 0 # resetting the index
            for task in list(tasks.keys()):
                taskArr.append(task) # store the name
                taskMap.append(f"{catagory}/{list(subcat.keys())[i]}/{task}") # store the path
            i += 1 # increment the index
    for i in range(0, len(taskArr)):
        print(taskArr[i])
    matches = process.extract(name, taskArr, limit=4) # find the most common patterns
    for match, score, index in matches:
        res_dict.append({ # append to result dict
            "name": match,
            "map": taskMap[index]
        })
    print(res_dict)
    return res_dict

@eel.expose
def addNewGroup(name):
    log("Making new group {name}..")
    data = TaskManager('r')
    data[name] = {} # makes an empty dictionary
    TaskManager('w', data)

@eel.expose
def newSubGroup(catagory, sub):
    log("Making new subgroup {catagory}..")
    data = TaskManager('r')
    data.setdefault(catagory, {}) # again, to check if the group exists or not
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
            res_arr.append(list(subgrp.keys())[i]) # add the subgroup
    print(res_arr)
    return res_arr

@eel.expose
def listGroupDict():
    data = TaskManager('r')

    #this is a short hand way to populate a dictionary
    data = {
        key: list(value.keys())
        for key, value in data.items()
    }
    return data

def listAllTasksDate():
    res_arr = [[], [], []] # 2d array to store results. structure:-
    """
        [
            [
             'path' of the task (group/subgroup/task),
             deadline of the task y/m/d/h/m
             is the task done of not (true/false)
            ]
        ]
    """
    data = TaskManager('r')
    for cat, subcat in data.items():
        for subcatt, task in subcat.items():
            for taskt, info in task.items():
                res_arr[0].append(f"{cat}/{subcatt}/{taskt}")
                res_arr[1].append(info['date'])
                res_arr[2].append(info["done"])
    return res_arr

@eel.expose
def listCatItems(cat, subcat):
    data = TaskManager('r')
    print(list(data[cat][subcat]))
    return list(data[cat][subcat]) # this provides the result as a LIST 

@eel.expose
def toggletask(path, setto):
    path_arr = path.split('/')
    data = TaskManager('r')
    print(path_arr)
    data[path_arr[0]][path_arr[1]][path_arr[2]]['done'] = setto # this sets the task's status to done/not done
    print("DATA:", data[path_arr[0]][path_arr[1]][path_arr[2]]['done'])
    TaskManager('w', data)

@eel.expose
def donestatus(path):
    path_arr = path.split('/')
    data = TaskManager('r')
    return data[path_arr[0]][path_arr[1]][path_arr[2]]['done'] # returns the status of the task

@eel.expose
def listAllRoutineNames():
    data = RoutineManager('r')
    res_arr = [] # res_arr is a 2D array that stores data like so:-
    """
        [
            [
                time (daily, weekly, monthly),
                routine name
            ]
        ]
    """
    for time in data:
        for routineName in data[time]:
            res_arr.append([time, list(routineName)[0]])
    print(res_arr)
    return res_arr

@eel.expose
def listRoutineTraits(time, routineName):
    data = RoutineManager('r')
    if data[time]: 
        for iterRoutineName in data[time]:
            print(list(iterRoutineName)[0])
            if list(iterRoutineName)[0] == routineName: # check if the routine name matches
                return iterRoutineName[next(iter(iterRoutineName))] # return its contents

@eel.expose
def validateDateTime(fullIso):
    target = datetime.fromisoformat(fullIso) # convert time from iso to datetime object
    now = datetime.now(timezone.utc) # convert to utc timezone
    if (target < now): # if the time is before today, the deadline is impossible
        return False
    return True


@eel.expose
def addRoutine(time, name):
    log("SUDDEND_ROUTINE")
    data = RoutineManager('r')
    data = dict(data)
    arr = []
    if time.lower() == "daily":
        arr = [0, 0, 0, 0, 0, 0, 0] # 7 values for 7 days of the week
    elif time.lower() == "weekly":
        arr = [0, 0, 0, 0] # 4 values for 4 weeks of the month
    elif time.lower() == "monthly":
        arr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] # 12 values for 12 months of the year
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
            "consistancy": arr
        }
    })
    RoutineManager('w', data)

@eel.expose
def setComplete(path):
    arr = path.split('/')
    data = RoutineManager('r')
    print(arr)
    data[arr[0]][int(arr[1])][arr[3]]["Complete till"] = arr[2] # sets which step of the routine the user completed till (inclusive,
#                                                               so if the user completed value is 'push ups' they have done push ups AND
#                                                               the tasks before that       

    RoutineManager('w', data)

@eel.expose
def loggedin():
    data = settingsManager('r')
    return data["AccMade"] # returns logged in status (if not logged in, send false, else send true)

@eel.expose
def setloggedin():
    data = settingsManager('r')
    data["AccMade"] = True
    settingsManager('w', data)

@eel.expose
def getColors():
    data = settingsManager('r')
    colorTheme = data['colors'][data['color']] # send the color theme (so the primary background color or outline color and stuff)
    """
        FUN FACT:-
          for the color, Just convert #hex to hsl (hue saturation lightness) to change colors
          while maintaining your brightness. so for example, because i started off by making pastle
          green, remaking the 'correct' pastel red, orange... would have been hard. hence, i made a
          python script to convert hex to hsl to a specific color automatically!
    """
    return colorTheme

@eel.expose
def changeColor(color):
    data = settingsManager('r')
    data['color'] = color 
    settingsManager('w', data)

@eel.expose
def routineDetailConfig():
    """
        this is actually a chart.js (an extension im using to make graphs) that i have used, but i used it 
        here because python is fit to manipulate data easily (libraries like pandas, tensor, etc. make this 
        possible) Hence, by using python, in the future if i want to add in extra graph details, i can do it
        here fast without dealing with R/IPC issues.
    """
    return {  
        "type": 'bar',
        "data": {
            "labels": [],
            "datasets": [{
                "label": 'Progress (%)',
                "data": [],
                "borderRadius": 10,
                "borderWidth": 2,
                "borderSkipped": False,
                "backgroundColor": 'rgba(0, 0, 0, 0.56)'
            }]
        },
        "options": {
            "indexAxis": 'x',
            "responsive": True,
            "maintainAspectRatio": False,
            "scales": {
                "x": {
                    "grid": {
                        "color": 'rgba(0, 0, 0, 0)'
                    }
                },
                "y": {
                    "max": 100,
                    "grid": {
                        "color": 'rgb(137, 234, 171)'
                    }
                }
            },
            "plugins": {
                "tooltip": {
                    "backgroundColor": '#33333380',
                    "titleColor": '#ffffff',
                    "bodyColor": '#ffffff',
                    "footerColor": '#70f67079',
                    "borderColor": '#33333387',
                    "borderWidth": 1,
                    "displayColors": True,
                    "boxPadding": 3
                },
                "legend": {
                    "display": True,
                    "position": 'top',
                }
            }
        }
    }

@eel.expose
def routineSummaryConfig(label, fix_dataPoints, primary_highlight_color):
    return {
        "type": 'line',
        "data": {
            "labels": label,
            "datasets": [{
                "label": 'Progress (%)',
                "data": fix_dataPoints,
                "borderWidth": 2,
                "backgroundColor": 'rgba(0, 0, 0, 0.56)'
            }]
        },
        "options": {
            "indexAxis": 'x',
            "responsive": True,
            "maintainAspectRatio": False,
            "scales": {
                "x": {
                    "grid": {
                        "color": 'rgba(0, 0, 0, 0)'
                    }
                },
                "y": {
                    "max": 100,
                    "grid": {
                        "color": primary_highlight_color
                    }
                }
            },
            "plugins": {
                "tooltip": {
                    "enabled": False,
                },
                "legend": {
                    "display": False,
                }
            }
        }
    }   

@eel.expose
def CleanUp():
    data = TaskManager('r')
    now = datetime.now()
    values = listAllTasksDate()
    key = 0
    new_data = data
    for date in values[1]:
        date_arr = date.split('/')
        target_date = datetime_date(int(date_arr[0]), int(date_arr[1]), int(date_arr[2])) # turn my path into a date object
        if target_date < now.date(): # if deadline has already passed
            taskname = values[0][key].split('/')[2]
            taskpath = values[0][key].split('/')[0:2]
            print(taskname, taskpath)
            del new_data[taskpath[0]][taskpath[1]][taskname] # delete the task
        key += 1
    print(new_data)
    TaskManager('w', new_data)
    time.sleep(1)
    sys.exit()

def exitCode(page_route, remaining_websockets):
    if not remaining_websockets: # if there are no more front end instances
        CleanUp() # start the clean up code

@eel.expose
def challangeinfo(info, completed):
    # info is data from firebase, its basically a dict that says which tasks the user has to do today
    # and what the rewards (xp) are and has the user done it or not. again, i have moved this logic
    # to python just in case if in the future i want to do more data manupilation 

    # val is a 3d array that looks like this:-
    """
        [
            [
                "The name of the challange"
                "The ammount of XP the challange is worth"
                "If the task is done or not (true/false)"
            ]
        ]
    """
    val = [
        [info["Tasks"][index], info["XP"][index], value] for index, value in enumerate(completed)
        # enumerate just means add index too so 'data' turns into (<INDEX>, 'data')
    ]
    print(val)
    return val

@eel.expose
def checkForStart():
    setData = settingsManager('r')
    rData = RoutineManager('r')
    now = datetime.now().date()
    times = ['daily', 'weekly', 'monthly']
    if now.isoformat() <= setData["LastChecked"]:
        return
    
    # scroll down to mainProc (within this function) to get the start point
        
    def getIndex(time):
        day = 0
        match (time):
            case "daily":
                day = (now.weekday() + 1) % 7
                print(day)
            
            case "weekly":
                day = min((now.day - 1) // 7 + 1, 4) - 1 # resort to 4 is week is '4' (but i consider 4 as part of next month)
                print(day)
            
            case "monthly":
                day = now.month - 1
                print(day)
        return day

    def stops_handling(time, index, routine):

        def handle_correct_index(br_index):
            complete_till = rData[time][index][routine]["Complete till"]
            if complete_till != "":
                rData[time][index][routine]["stops"][br_index] = complete_till
                rData[time][index][routine]["index"] += 1 # increment the index for the next day
                
        
        def handle_append():
            complete_till = rData[time][index][routine]["Complete till"]
            if complete_till != "":
                rData[time][index][routine]["stops"].append(complete_till)
        
        if rData[time][index][routine]["index"] > 3: # if the index is more than the size of the stops array (remember, start from 0 NOT 1)
            rData[time][index][routine]["index"] = 0 # set index to 0 
            handle_correct_index(rData[time][index][routine]["index"]) # do NOT append, instead use the index 

        elif len(rData[time][index][routine]["stops"]) == 4: # when we have the correct length of stops
            handle_correct_index(rData[time][index][routine]["index"]) # do NOT append, instead use the index 
        elif len(rData[time][index][routine]["stops"]) < 4: # when we have LESS that the correct length of stops
            handle_append() # APPEND the stop

    def addHardestandEasiest(time, index, routine):
        """
            INFO:
                im finding the hardest task by checking the mode of the stops
                im finding the easiest task by checking the task least appearing in the stops array
        """
        counts = pandas.Series(rData[time][index][routine]["stops"]).value_counts()  # convert into pandas series
        
        max_val = counts.idxmax()     # find the most reoccuring task
        max_count = int(counts.max()) # find the number of times it has reoccured (for futurre purposes) AND NOTE:-
#                                       this is stored as PANDAS_i64 (integer of 64 bits), and json cant store this,
#                                       hence, i used the int function to convert i64 to normal traditional python int
#                                       SAME THING OCCURS FOR LEAST COMMON 

        min_val = counts.idxmin()     # find the least occuring task
        min_count = int(counts.min()) # find the number of times it has happened

        print(type(max_val), type(max_count), type(min_count), type(min_val)) # you can remove the int wrappers and see the
#                                                                               pandas i64 type for yourself

        rData[time][index][routine]["Most difficult"]["name"] = max_val
        rData[time][index][routine]["Most difficult"]["score"] = max_count
        rData[time][index][routine]["Most easiest"]["name"] = min_val
        rData[time][index][routine]["Most easiest"]["score"] = min_count

    def calcConsistancy(time, index, routine):
        count = 0
        for task in rData[time][index][routine]["tasks"]:
            if task == rData[time][index][routine]["Complete till"]: # if we have reached the task
                count += 1 # remember, its inclusive
                break;
            count += 1 # increment
        consistancy = (count / len(rData[time][index][routine]["tasks"])) * 100 # calculate percentage
        br_index = getIndex(time)                                               # get the index
        print(time)
        rData[time][index][routine]["consistancy"][br_index] = consistancy

    def setStreak(time, index, routine):
        match (time):
            case "daily": # if its daily, streak resets everyday if task isnt done
                last_check = setData["LastChecked"]
                rData[time][index][routine]["Complete till"] = "" # this will reset which task the user has completed till
                """
                    INFO:-
                      in iso, T seperates date and time so 2026-06-12T12:23 could be an iso
                """
                last_check = datetime_date.fromisoformat(last_check.split('T')[0]) # convert from iso to date object
                if now - last_check >= timedelta(days=1):
                    if rData[time][index][routine]["Complete till"] == "":
                        rData[time][index][routine]["Streak"] = 0
                    else:
                        rData[time][index][routine]["Streak"] += 1
            case "weekly": # if its weekly, streak resets every week if task isnt done
                last_check = setData["LastWeekChecked"]
                rData[time][index][routine]["Complete till"] = "" # this will reset which task the user has completed till
                last_check = datetime_date.fromisoformat(last_check.split('T')[0]) # convert from iso to date object
                if now - last_check >= timedelta(weeks=1):
                    if rData[time][index][routine]["Complete till"] == "":
                        rData[time][index][routine]["Streak"] = 0
                    else:
                        rData[time][index][routine]["Streak"] += 1
            case "monthly": # if its monthly, streak resets every month if task isnt done
                last_check = setData["LastMonthChecked"]
                rData[time][index][routine]["Complete till"] = "" # this will reset which task the user has completed till
                last_check = datetime_date.fromisoformat(last_check.split('T')[0]) # convert from iso to date object
                if now >= last_check + relativedelta(months=1):
                    if rData[time][index][routine]["Complete till"] == "":
                        rData[time][index][routine]["Streak"] = 0
                    else:
                        rData[time][index][routine]["Streak"] += 1
    

    def cleanUp():
            last_check = setData["LastWeekChecked"]
            last_check = datetime_date.fromisoformat(last_check.split('T')[0])
            if now - last_check >= timedelta(weeks=1):
                setData["LastWeekChecked"] = now.isoformat()

            
            last_check = setData["LastMonthChecked"]
            last_check = datetime_date.fromisoformat(last_check.split('T')[0])
            if now >= last_check + relativedelta(months=1):
                setData["LastMonthChecked"] = now.isoformat()

    def mainProc():
        for time in times:
            index = 0
            for routine_dict in rData[time]:
                routine = list(routine_dict.keys())[0] # this lets us get the routine name
                stops_handling(time, index, routine) # track which step the user stopped to
                addHardestandEasiest(time, index, routine) # this will set the easiest/hardest step
                calcConsistancy(time, index, routine) # this will calculate the percentage of the routine done
                setStreak(time, index, routine) # this will set the streak
                index += 1
        cleanUp()
        
        RoutineManager('w', rData)
        settingsManager('w', setData)
    
    mainProc()

@eel.expose
def listTasks(name):
    data = RoutineManager('r')
    times = ["daily", "weekly", "monthly"] # the times for routine
    for time in times:
        print(len(list(data[time])))
        for index in range(len(list(data[time]))):
            print(index)
            if list(data[time][index].keys())[0] == name:
                return data[time][index][name]['tasks'] # return the tasks of that routine

@eel.expose
def appendRoutineTask(task, name, newTask):
    data = RoutineManager('r')
    times = ['daily', 'weekly', 'monthly']
    for time in times:
        for index in range(len(list(data[time]))):
            if list(data[time][index].keys())[0] == name:
                indx = data[time][index][name]['tasks'].index(task) # get the index of the task we want put the new task after
                print(indx)
                data[time][index][name]['tasks'].insert(indx + 1, newTask) # this adds a new task to the routine
    RoutineManager('w', data)


###  === Context Functions === ###

@eel.expose
def delete(name):
    print("deleting task..", name)
    name = name.split('/')
    data = TaskManager('r')
    del data[name[0]][name[1]][name[2]] # del stands for delete, it is a python 3.10 keyword and removes the particular
#                                         in this context
    TaskManager('w', data)

@eel.expose
def rename(name, newName):
    print("renaming task..")
    name = name.split('/')
    data = TaskManager('r')
    data[name[0]][name[1]][newName] = data[name[0]][name[1]].pop(name[2]) # pop is used to get rid
#                                                                           of the key and then asign a 
#                                                                           new name in this context
    TaskManager('w', data)
    

@eel.expose
def dead(name, time, date): # dead stands for deadline
    print("Changing deadline task..")
    name = name.split('/')
    data = TaskManager('r')
    formated = f"{date}/{time}"
    print(formated)
    formated = formated.replace(":", "/").replace("-", "/")
    """
        INFO:-
         in iso format, : is used for time, and - is used for date, but my apps
         'path' based format, it uses / for both, hence the replace functions was
         used
    """
    print(formated)
    data[name[0]][name[1]][name[2]]["date"] = formated
    print(data)
    TaskManager('w', data)

@eel.expose
def info(name):
    print("Displaying details")
    name = name.split('/')
    data = TaskManager('r')
    selected_data = data[name[0]][name[1]][name[2]]
    date = ""
    time = ""
    slash_count = 0
    """
        Right now, we are extracting ONLY the time part from my format
        y/m/d/h/m (only extracting h/m)
        You will notice there are 3 slashes before h/m (and this will always be true)
        hence i will loop over each char of the time and check how many slashes there are
        if there are 3, then i will start adding the letters to another variable
    """
    for char in selected_data["date"]:
        if char == "/":
            slash_count += 1
        if slash_count >= 3:
            char = char.replace("/", ":")
            time += char
            continue
        date += char
    time = time[1:] # getting rid of the /
    print(date, time)
    name = "/".join(name)
    
    return f"Deadline: {date}, and do it by {time}\n Path: {name}"
    

@eel.expose
def delGroup(name):
    print("deleteing group")
    data = TaskManager('r')
    print(name)
    del data[name]
    TaskManager('w', data)

@eel.expose
def renameGroup(name, newName):
    print("Renaming group")
    data = TaskManager('r')
    data[newName] = data.pop(name)
    TaskManager('w', data)
    
@eel.expose
def delSubGroup(name):
    print("deleteing subgroup")
    data = TaskManager('r')
    name = name.split("/")
    del data[name[0]][name[1]]
    TaskManager('w', data)

@eel.expose
def renameSubGroup(name, newName):
    print("reanming subgroup")
    data = TaskManager('r')
    name = name.split('/')
    print(name)
    data[name[0]][newName] = data[name[0]].pop(name[1])
    print(data)
    TaskManager('w', data)

@eel.expose
def delRoutine(name):
    print("deleting routine")
    data = RoutineManager('r')
    name = name.split('/')
    print(name)
    del data[name[0]][int(name[1])]
    RoutineManager('w', data)

@eel.expose
def routineRename(name, newName):
    print("renaming routine")
    data = RoutineManager('r')
    name = name.split('/')
    print(name)
    data[name[0]][int(name[1])][newName] = data[name[0]][int(name[1])].pop(name[2])
    print(data)
    RoutineManager('w', data)

@eel.expose
def delRoutineTask(name):
    print("deleting task in routine")
    print(name)
    data = RoutineManager('r')
    name = name.split('/')
    tar_index = 0
    for index, value in enumerate(data[name[0]]):
        print("value: ", list(value.keys())[0])
        if list(value.keys())[0] == name[2]:
            tar_index = index
            break
    print(tar_index)
    del data[name[0]][tar_index][name[2]]["tasks"][int(name[3])]
    RoutineManager('w', data)

@eel.expose
def changeRoutineTaskPosition(name, direction):
    print("changing position")

    data = RoutineManager('r')
    name = name.split('/')
    tar_index = 0

    for index, value in enumerate(data[name[0]]):
        print("value: ", list(value.keys())[0])
        if list(value.keys())[0] == name[2]:
            tar_index = index
            break
    print(tar_index)



    current = data[name[0]][tar_index][name[2]]["tasks"][int(name[3])]
    next = ""

    if direction == "up":
        next = data[name[0]][tar_index][name[2]]["tasks"][int(name[3]) + 1]
        # This is called tuple asignment, same as regular asignment just simpler:-
        data[name[0]][tar_index][name[2]]["tasks"][int(name[3])], data[name[0]][tar_index][name[2]]["tasks"][int(name[3]) - 1] = next, current



    else:
        next = data[name[0]][tar_index][name[2]]["tasks"][int(name[3]) - 1]
        data[name[0]][tar_index][name[2]]["tasks"][int(name[3])], data[name[0]][tar_index][name[2]]["tasks"][int(name[3]) + 1] = next, current
    

    RoutineManager('w', data)
        



    print(name)

@eel.expose
def routineTaskRename(name, newName):
    print("renaming routine task")
    data = RoutineManager('r')
    name = name.split('/')
    tar_index = 0
    for index, value in enumerate(data[name[0]]):
        print("value: ", list(value.keys())[0])
        if list(value.keys())[0] == name[2]:
            tar_index = index
            break
    print(tar_index)

    data[name[0]][tar_index][name[2]]['tasks'][int(name[3])] = newName
    
    RoutineManager('w', data)

@eel.expose # NOT A PART OF THE CONTEXT FUNCTIONS
def notcheckedtoday():
    data = settingsManager('r')
    now = datetime.now().date()
    if now.isoformat() > data["LastChecked"]:
        data["LastChecked"] = now.isoformat() # update the date
        settingsManager('w', data)
        return True
    return False


checkForStart() # doing our start up checks
eel.start('index.html', port=55555, close_callback=exitCode)

"""
    eel.start has several important parameters
    the first parameter will be our main html file
    then we have other optional parameters we can use (2 are used here)

    port -> A port number can be between 0 to 65,535 but only 1 backend
            can connect to one backend. hence, we can use the port parameter
            to specifiy which port our backend will connect to. HOWEVER, we
            used port 0. port 0 means, provide my backend ANY port that is
            not occupied

    close_callback -> When the app closes, normally, eel deals with closing
                      the ports and performs other functions. however, I need
                      to run my own clean up functions and hence, I used
                      close_callback parameter to tell eel to run my one closing
                      function.
"""

