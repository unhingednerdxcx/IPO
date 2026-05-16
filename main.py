import time
import eel
import os

start = time.time()

FOLDER = os.path.dirname(os.path.abspath(__file__))
WFOLDER = os.path.join(FOLDER, "web")

print("Init starting")
eel.init(WFOLDER)

print("Starting Eel")
eel.start('index.html', port=8000)

print("Total time:", time.time() - start)