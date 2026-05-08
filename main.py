import questionary
import json
import os


TASK_PATH = os.path.join("data", "tasks.json")
def view():
    with open(TASK_PATH, 'r') as file:
        data = json.load(file)
        print(preetify(data))

def preetify(content):
    preety_content = ""
    for taskName, taskData in content.items():
        preety_content += f"""
        task name: {taskName}
        task completed: {taskData["complete"]}
        task hidden: {taskData["hide"]}
        """
    return preety_content

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
    print(f"""==== Added task: {new_task}! ====""")

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

