import questionary
import json
import os


TASK_PATH = os.path.join("data", "tasks.json") # path to the json file
SPACE_MIN = 2 # minimum spacing needed

### VIEW ###
def view():
    print("""
    ===== View tasks =====""")
    # Read the contents of the file
    with open(TASK_PATH, 'r') as file:
        data = json.load(file)
        choices = [ # Turn the choices into number (so we can index the choice)
            questionary.Choice(title=item, value=i) # Creating choices, the title being the result of the preetify
#           function and the vaalue being the index (the variables are declared later in the for loop)
            for i, item in enumerate(preetify(data)) # Preetify will provide the information of the task in a preety way
        ]
        task = questionary.select(
            "Select to toggle",
            choices=choices
        ).ask()
        if not(task == len(choices)-1): # If not go back to menu
            toggle(task, data) # toggle the value
    print("")


### PREETIFY ###
def preetify(content):
    preety_array = [] # array that we will return
    longest = len(max(content.keys(), key=len)) + SPACE_MIN # find the task with the longest chars and add minimum space
    for taskName, taskData in content.items():
        differnce = longest - len(taskName) # find how many spaces we need
        spacing = ""
        for i in range(1, differnce):
            spacing += " " # add spaces to the variable
        preety_content = f"""{taskName}{spacing}| {"done" if taskData["complete"] else "not done"}
        """ # make the text preety
        preety_array.append(preety_content) # add it to the array

    preety_array.append(""" >> Back to main menu""") # Add the return to main menu option
    return preety_array


### TOGGLE ###
def toggle(task, data):
    items= list(data.items()) # turn dict -> list
    _key, value = items[task] # get the task's key(not needed) and value
    value["complete"] = not(value["complete"]) # toggle the values
    value["hide"] = not(value["hide"]) # toggle the values
    data = dict(items) # turn list -> dict
    with open(TASK_PATH, 'w') as file:
        json.dump(data, file, indent=4)


### ADD ###
def add():
    print("""
    ===== Enter a new task =====""")
    new_task = input("Task: ") # Collect the name of the new task
    # Read the content of the file:-
    with open(TASK_PATH, 'r') as file:
        data = json.load(file) 
    data[new_task] = { # Create a new entry with default values
        "complete": False,
        "hide": False
    }
    with open(TASK_PATH, 'w') as file: # Write the task to the file
        json.dump(data, file, indent=4) # Write in json format (indent=4 specifies indentation)
        
    print(f"""==== Added task: {new_task} ! ====\n""")


### CLEAR ###
def clearAll():
    # Read the content of the file first
    with open(TASK_PATH, 'r') as file:
        data = json.load(file) 

    toDelete = [] # This array will store every task to delete

    for taskName, taskData in data.items(): # loop over the json entries
        if taskData["hide"] == True: # If the key hide contains the value 'true'
            toDelete.append(taskName) # Add the entry to the delete array

    for taskName in toDelete:  # Loop over the values in the array toDelete
        del data[taskName] # Delete the task

    with open(TASK_PATH, 'w') as file: # Write the task to the file
        json.dump(data, file, indent=4) # Write in json format (indent=4 specifies indentation)

    print("Deleted completed tasks!\n")


### MAIN ###
def main():
    while True: # A variable here would be useless as we want to keep running the loop until the user selects 'stop'

        action = questionary.select(
            "Pick an action",
            choices=['view', 'add', 'clear all completed task', 'stop']
        ).ask() # This is where we take the selection from the user and store the selected value in the variable 'action'

        ###
#           INFO: match/case is a new python 3.10+ syntax. However, older versions of python may fail when trying to
#           execture this block of code. match/case is like switch/case.
        ###
        match action:
            case "view":
                view() # This is the function to view the tasks
            case "add":
                add() # This is the function to add a new task
            case "clear all completed task":
                clearAll() # This is the function to clear all completed tasks
            case "stop":
                print("Goodbye user!\n")
                break # This exits from the loop, completing the function



if __name__ == "__main__":
    # This ensures the .py app is being called directly
    main() # This is the main function

