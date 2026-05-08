# Internation Python Olympiad (IPO) 2026
Hi, this is a repo for my To-Do list for the IPO 2026.

# Information
This To-Do list uses `questionary` to allow users to use arrow keys or pointer to select
options. We use `json` to store the users data. You can view `data/tasks.jsonc` to see how
the data is organized.

---

# How to use
Firstly you need

- python v3.10 or higher
- the questionary module

If you dont have any one of them view the **Dependency** heading (found later in this markdown
file)

To run:

for **Windows**
```powershell
cd <INSERT PATH>
python -m pip install -r modules.txt
python main.py
# if that dosent work use:-
py main.py
```

for **MacOS / Linux**(for Arch-based distros, view the **Dependency** heading (found later in this
markdown file))
```bash
cd <INSERT PATH>
pip install -r modules.txt
python main.py
```

---

# Dependency

Visit [Python.org](https://www.python.org/downloads/)
to install the latest version of python (anything about 3.10). To install questionary run ```pip install questionary```

**FOR ARCH BASED DISTROS** (Manjaro, EndeavourOS, Arch...) run
```bash
python -m venv .venv
source .venv/bin/activate
```
to get python set up (you can start using commands like pip)

**USE THIS IF YOU GET ERRORS WHEN USING PIP. AN EXAMPLE OF THE ERROR MESSAGE IS**:-

```log
error: externally-managed-environment

× This environment is externally managed
╰─> To install Python packages system-wide, try 'pacman -S
    python-xyz', where xyz is the package you are trying to
    install.
    
    If you wish to install a non-Arch-packaged Python package,
    create a virtual environment using 'python -m venv path/to/venv'.
    Then use path/to/venv/bin/python and path/to/venv/bin/pip.
    
    If you wish to install a non-Arch packaged Python application,
    it may be easiest to use 'pipx install xyz', which will manage a
    virtual environment for you. Make sure you have python-pipx
    installed via pacman.

note: If you believe this is a mistake, please contact your Python installation or OS distribution provider. You can override this, at the risk of breaking your Python installation or OS, by passing --break-system-packages.
hint: See PEP 668 for the detailed specification.
```
