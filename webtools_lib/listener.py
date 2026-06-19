current = "Default"
current_tab = "."

def make3d(info, completed):
    val = [
        [info["Tasks"][index], info["XP"][index], value] for index, value in enumerate(completed)
    ]
    print(val)
    return val