import questionary
import json
import os


TASK_PATH = os.path.join("data", "tasks.json")
SPACE_MIN = 2
def view():
    print("""
    ===== View tasks =====""")
    with open(TASK_PATH, 'r') as file:
        data = json.load(file)
        choices = [
            questionary.Choice(title=item, value=i)
            for i, item in enumerate(preetify(data))
        ]
        task = questionary.select(
            "Select to toggle",
            choices=choices
        ).ask()
        if not(task == len(choices)-1):
            toggle(task, data)

def preetify(content):
    preety_array = []
    longest = len(max(content.keys(), key=len)) + SPACE_MIN
    for taskName, taskData in content.items():
        differnce = longest - len(taskName)
        spacing = ""
        for i in range(1, differnce):
            spacing += " "
        preety_content = f"""{taskName}{spacing}| {"done" if taskData["complete"] else "not done"}
        """
        preety_array.append(preety_content)

    preety_array.append(""" >> Back to main menu""")
    return preety_array

def toggle(task, data):
    items= list(data.items())
    key, value = items[task]
    value["complete"] = not(value["complete"])
    value["hide"] = True
    data = dict(items) 
    with open(TASK_PATH, 'w') as file:
        json.dump(data, file, indent=4)


def add():
    print("""
    ===== Enter a new task =====""")
    new_task = input("Task: ")
    with open(TASK_PATH, 'r') as file:
        data = json.load(file)
    data[new_task] = {
        "complete": False,
        "hide": False
    }
    with open(TASK_PATH, 'w') as file:
        json.dump(data, file, indent=4)
        
    print(f"""==== Added task: {new_task} ! ====""")

def clearAll():
    with open(TASK_PATH, 'r') as file:
        data = json.load(file)
    toDelete = []
    for taskName, taskData in data.items():
        if taskData["hide"] == True:
            toDelete.append(taskName)
    for taskName in toDelete:
        del data[taskName]
    with open(TASK_PATH, 'w') as file:
        json.dump(data, file, indent=4)
    print("Deleted completed tasks!")

def main():
    while True:
        action = questionary.select(
            "Pick an action",
            choices=['view', 'add', 'clear all completed task', 'stop']
        ).ask()
        match action:
            case "view":
                view()
            case "add":
                add()
            case "clear all completed task":
                clearAll()
            case "stop":
                print("Goodbye!")
                break

if __name__ == "__main__":
    main()

