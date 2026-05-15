import eel
import os

# FOLDERS:-
FOLDER = os.path.dirname(os.path.abspath(__file__))
WFOLDER = os.path.join(FOLDER, "web")
eel.init(WFOLDER)
eel.start('index.html', port=0)

