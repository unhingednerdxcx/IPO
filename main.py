import questionary
import json
import os

TASK_PATH = os.path.join("data", "tasks.json")
def view():
    with open(TASK_PATH, 'r') as file:
        print(file.read())


def main():
    print("START")
    action = questionary.select(
        "Pick an action",
        choices=['view', 'add']
    ).ask()
    match action:
        case "view":
            print("VIEW FUNCTION WILL BE RAN HERE")
        case "add":
            print("ADD FUNCTION WILL BE ADDED HERE")

if __name__ == "__main__":
    main()

