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
        if not(task == """ >> Back to main menu"""):
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
    value["hide"] = False
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

def main():
    print("START")
    action = questionary.select(
        "Pick an action",
        choices=['view', 'add']
    ).ask()
    match action:
        case "view":
            view()
        case "add":
            add()

if __name__ == "__main__":
    main()

