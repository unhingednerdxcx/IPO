document.addEventListener("DOMContentLoaded", main);
function main() {
    document.getElementById("side-search")?.addEventListener("click", async() => {
        const input = document.getElementById("context-input") as HTMLInputElement
        input.type = "text";
        console.log("shwoing context...");
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
                    console.log(value) //here we will call eel
                    input.removeEventListener("keydown", search_handler)
                }
            }
            search_handler = (e: KeyboardEvent) => search(e, el, input);
            input.addEventListener("keydown", search_handler)
        }
    });

    
    document.getElementById("side-new-task")?.addEventListener("click", async() => {
        console.log("shwoing context...");
        let name = "";
        let nameEntered = false;
        let date = "";
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

                }
            }
            let date_handler: any;
            date_handler = (e: any) => {
                if (nameEntered) {
                    date = input.value
                    input.value = ""
                    input.removeEventListener("change", date_handler)
                    el.style.display = "none"
                    console.log(name, date)
                }
            }

            input.addEventListener("keydown", name_handler);
            input.addEventListener("change", date_handler);
        }
    });
}
