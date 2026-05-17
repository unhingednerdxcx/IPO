document.addEventListener("DOMContentLoaded", main);
const eel = (window as any).eel;
console.log(eel)
let current = "Default";
function main() {
    document.getElementById("side-search")?.addEventListener("click", async() => {
        const input = document.getElementById("context-input") as HTMLInputElement
        input.type = "text";
        console.log("showing context...");
        let value = ""
        const text = "Enter the task you want to search for"
        const el = document.querySelector("#hide-all") as HTMLElement | null;
        const description = document.getElementById("context-description");
        if (el && description) {
            description.innerHTML = text;
            el.style.display = "block";
            let search_handler: any = ""
            async function search(e: any, el:any, input:any) {
                if (e.key == "Enter") {
                    el.style.display = "none";
                    let value = input.value;
                    input.value= "";
                    await eel.searchTask(value)
                    input.removeEventListener("keydown", search_handler)
                }
            }
            search_handler = (e: KeyboardEvent) => search(e, el, input);
            input.addEventListener("keydown", search_handler)
        }
    });

    
    document.getElementById("side-new-task")?.addEventListener("click", async() => {
        console.log("showing context...");
        let name = "";
        let nameEntered = false;
        let dateEntered = false;
        let date = "";
        let total_time = "";
        const text = "Enter the name of the new task"
        const el = document.querySelector("#hide-all") as HTMLElement | null;
        const description = document.getElementById("context-description");
        if (el && description) {
            description.innerHTML = text;
            el.style.display = "block";
            const input = document.getElementById("context-input") as HTMLInputElement
            let name_handler: any;
            input.type = "text";
            name_handler = (e: KeyboardEvent) =>{
                if (e.key == "Enter") {
                    name = input.value;
                    input.value= "";
                    input.type = "date"
                    input.removeEventListener("keydown", name_handler)
                    nameEntered = true
                    input.addEventListener("change", date_handler);
                    description.innerHTML = "Enter the date of the new task"
                }
            }
            let date_handler: any;
            date_handler = () => {
                const description = document.getElementById("context-description");
                if (nameEntered && description) {
                    date = input.value
                    input.value = ""
                    input.type = "time"
                    input.removeEventListener("change", date_handler)
                    dateEntered = true
                    input.addEventListener("change", time_handler);
                    description.innerHTML = "Enter the time of the new task"
                }
            }
            let time_handler: any;
            time_handler = async() => {
                if (dateEntered) {
                    let time = input.value
                    input.value = ""
                    input.type = "time"
                    input.removeEventListener("change", time_handler)
                    let in_date = new Date(date);
                    let today = new Date();
                    const [hour, minute] = time.split(':').map(Number)
                    if (hour && minute){
                        in_date.setHours(hour, minute, 0, 0);
                        today.setHours(0, 0, 0, 0);
                        if (in_date >= today) {
                            el.style.display = "none"
                            await eel.addTask(name, "catagory will be soon added", in_date) // TODO: add catagory (yes haha, todo cause im making a todo list (: ))
                        } else {
                            el.style.display = "none"
                            showmsgbox("Date cannot be before today")
                        }
                    } else {
                        el.style.display = "none"
                    }
                }
            }

            input.addEventListener("keydown", name_handler);
        }
    });

    document.getElementById("side-Today")?.addEventListener('click', async() => {
        const today = document.querySelector("#Today") as HTMLElement | null;
        const current_element = document.querySelector(`#${current}`) as HTMLElement | null;
        if (today && current_element) {
            current_element.style.display = "none"
            today.style.display = "flex"
            current = "Today"
            await eel.listTask()
        }
    });
    document.getElementById("side-upcoming")?.addEventListener('click', async() => {
        const today = document.querySelector("#Today") as HTMLElement | null;
        const current_element = document.querySelector(`#${current}`) as HTMLElement | null;
        if (today && current_element) {
            current_element.style.display = "none"
            today.style.display = "flex"
            current = "Today"
            await eel.listTask()
        }
    });

    document.getElementById('side-group')?.addEventListener('click', async() => {
        const input = document.getElementById("context-input") as HTMLInputElement
        input.type = "text";
        console.log("showing context...");
        let value = ""
        const text = "Enter the new group you want to make"
        const el = document.querySelector("#hide-all") as HTMLElement | null;
        const description = document.getElementById("context-description");
        if (el && description) {
            description.innerHTML = text;
            el.style.display = "block";
            let search_handler: any = ""
            async function search(e: any, el:any, input:any) {
                if (e.key == "Enter") {
                    el.style.display = "none";
                    let value = input.value;
                    input.value= "";
                    await eel.addNewGroup(value)
                    input.removeEventListener("keydown", search_handler)
                }
            }
            search_handler = (e: KeyboardEvent) => search(e, el, input);
            input.addEventListener("keydown", search_handler)
        }
    })
}

function showmsgbox(text: string) {
    let box = document.querySelector("#msg-box") as HTMLElement | null;
    let msg = document.getElementById("msg-text") as HTMLElement | null;
    if (box && msg) {
        msg.innerText = text;
        box.classList.add("show")
        setTimeout(() => {
            box.classList.remove("show")
        }, 3000)
    }
}


