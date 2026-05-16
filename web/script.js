document.addEventListener("DOMContentLoaded", main);
let current = "Default";
function main() {
    document.getElementById("side-search")?.addEventListener("click", async () => {
        const input = document.getElementById("context-input");
        input.type = "text";
        console.log("shwoing context...");
        let value = "";
        const text = "Enter the task you want to search for";
        const el = document.querySelector("#hide-all");
        const description = document.getElementById("context-description");
        if (el && description) {
            description.innerHTML = text;
            el.style.display = "block";
            let search_handler = "";
            async function search(e, el, input) {
                if (e.key == "Enter") {
                    el.style.display = "none";
                    let value = input.value;
                    input.value = "";
                    console.log(value); //here we will call eel
                    input.removeEventListener("keydown", search_handler);
                }
            }
            search_handler = (e) => search(e, el, input);
            input.addEventListener("keydown", search_handler);
        }
    });
    document.getElementById("side-new-task")?.addEventListener("click", async () => {
        console.log("shwoing context...");
        let name = "";
        let nameEntered = false;
        let dateEntered = false;
        let date = "";
        let total_time = "";
        const text = "Enter the name of the new task";
        const el = document.querySelector("#hide-all");
        const description = document.getElementById("context-description");
        if (el && description) {
            description.innerHTML = text;
            el.style.display = "block";
            const input = document.getElementById("context-input");
            let name_handler;
            input.type = "text";
            name_handler = (e) => {
                if (e.key == "Enter") {
                    name = input.value;
                    input.value = "";
                    input.type = "date";
                    input.removeEventListener("keydown", name_handler);
                    nameEntered = true;
                }
            };
            let date_handler;
            date_handler = () => {
                if (nameEntered) {
                    date = input.value;
                    input.value = "";
                    input.type = "time";
                    input.removeEventListener("change", date_handler);
                    dateEntered = true;
                    input.addEventListener("change", time_handler);
                }
            };
            let time_handler;
            time_handler = () => {
                if (dateEntered) {
                    let time = input.value;
                    input.value = "";
                    input.type = "time";
                    input.removeEventListener("change", time_handler);
                    let in_date = new Date(date);
                    let today = new Date();
                    const [hour, minute] = time.split(':').map(Number);
                    if (hour && minute) {
                        in_date.setHours(hour, minute, 0, 0);
                        today.setHours(0, 0, 0, 0);
                        if (in_date >= today) {
                            el.style.display = "none";
                            console.log(in_date);
                        }
                        else {
                            el.style.display = "none";
                            showmsgbox("Date cannot be before today");
                        }
                    }
                    else {
                        el.style.display = "none";
                    }
                }
            };
            input.addEventListener("keydown", name_handler);
            input.addEventListener("change", date_handler);
        }
    });
    document.getElementById("side-Today")?.addEventListener('click', () => {
        const today = document.querySelector("#Today");
        const current_element = document.querySelector(`#${current}`);
        if (today && current_element) {
            current_element.style.display = "none";
            today.style.display = "flex";
            current = "Today";
        }
    });
    document.getElementById("side-upcoming")?.addEventListener('click', () => {
        const today = document.querySelector("#Today");
        const current_element = document.querySelector(`#${current}`);
        if (today && current_element) {
            current_element.style.display = "none";
            today.style.display = "flex";
            current = "Today";
        }
    });
}
function showmsgbox(text) {
    let box = document.querySelector("#msg-box");
    let msg = document.getElementById("msg-text");
    if (box && msg) {
        msg.innerText = text;
        box.classList.add("show");
        setTimeout(() => {
            box.classList.remove("show");
        }, 3000);
    }
}
export {};
//# sourceMappingURL=script.js.map