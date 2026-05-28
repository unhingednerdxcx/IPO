document.addEventListener("DOMContentLoaded", main);
declare const Chart: typeof import('chart.js').Chart;

declare global {
  interface Window {
    makeNewSubGroup: (catagory: string) => void;
  }
}

const eel = (window as any).eel;
console.log(eel)
let current = "Default";
function main() {
    window.requestAnimationFrame(() => {
        setTimeout(() => {
            makeChart();
        }, 50);
    });
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
                    let search_val = await eel.searchTask(value)()
                    console.log(search_val)
                    searchBoxShow(search_val, value)
                    input.removeEventListener("keydown", search_handler)
                }
            }
            search_handler = (e: KeyboardEvent) => search(e, el, input);
            input.addEventListener("keydown", search_handler)
        }
    });
    function searchBoxShow(searches: Object, value: string ) {
        let hideall = document.getElementById("hide-all-search") as HTMLElement || null
        if (hideall) {
            hideall.style.display = "flex"
            let title = document.getElementById('search-title') as HTMLElement || null
            title.innerText = `Searching for: ${value}`

            let results_par = document.getElementById('search-ress') as HTMLElement || null
            Object.entries(searches).forEach(([k, v]) => {
                console.log("$$", k,v.name, v)
                let li = document.createElement('li')
                li.classList = 'search-res'

                let name = document.createElement('div')
                name.classList = "search-content"
                name.innerText = v.name

                let map = document.createElement('div')
                map.classList = "search-map"
                map.innerText = v.map
                
                li.appendChild(name)
                li.appendChild(map)
                results_par.appendChild(li)
            })
            let hideallhandle = (e: KeyboardEvent) => {
                if (e.key == 'Escape') {
                    hideall.style.display = "none"
                    document.removeEventListener('keydown', hideallhandle)
                }
            }
            document.addEventListener('keydown', hideallhandle)
        }
    }

    
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
                            let clean_date = [
                                in_date.getFullYear(),
                                String(in_date.getMonth() + 1),
                                String(in_date.getDate()),
                                String(in_date.getHours()),
                                String(in_date.getMinutes())
                            ].join('/')
                            console.log(clean_date)
                            await eel.addTask(name, "My projects", "My projects", clean_date)
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
            let val = await eel.listTask("", "", "today")()
            console.log(typeof(val))
            console.log(val)
            list_items(val)
        }
    });
    document.getElementById("side-upcoming")?.addEventListener('click', async() => {
        const today = document.querySelector("#Today") as HTMLElement | null;
        const current_element = document.querySelector(`#${current}`) as HTMLElement | null;
        if (today && current_element) {
            current_element.style.display = "none"
            today.style.display = "flex"
            current = "Today"
            let value = await eel.listTask("", "", "upcomming")()
            console.log(value)
            console.log(typeof(value))
            list_items(value)
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
            let NewGroup_handler: any = ""
            async function NewGroup(e: any, el:any, input:any) {
                if (e.key == "Enter") {
                    el.style.display = "none";
                    let value = input.value;
                    input.value= "";
                    await eel.addNewGroup(value)
                    input.removeEventListener("keydown", NewGroup_handler)
                }
            }
            NewGroup_handler = (e: KeyboardEvent) => NewGroup(e, el, input);
            input.addEventListener("keydown", NewGroup_handler)
        }
    })
    makeSubGroupTree()
}

async function list_items(tasks: Array<String>) {
    let lists = document.getElementById('tasks') as HTMLElement|| null
    if (tasks && lists) {
        lists.innerHTML = ''
        let taskKey = 0
        tasks.forEach(task => {
            taskKey += 1
            console.log(task)
            let task_par = document.createElement('li')
            task_par.classList = 'task'

            let task_btn = document.createElement('button')
            task_btn.classList = 'toggle-task'
            task_btn.id = `task-btn${taskKey}`
            task_btn.onclick = () => {
                toggle(task_btn.id)
            }

            function toggle(id: String){
                console.log(id.split('task-btn'))
                let key = id.split('task-btn')[1]
                let icon = document.getElementById(`task_ico${key}`) as HTMLElement || null
                if (icon) {
                    if (icon.innerText == "check_small") {
                        icon.innerText = ""
                    } else {
                        icon.innerText = "check_small"
                    }
                }
            }


            let ico = document.createElement('span')
            ico.classList = 'material-symbols-outlined default-icon check-task'
            ico.id = `task_ico${taskKey}`


            let task_desc = document.createElement('span')
            task_desc.classList = "task-description"
            task_desc.innerText = String(task)

            task_btn.appendChild(ico)
            task_par.appendChild(task_btn)
            task_par.appendChild(task_desc)
            lists?.appendChild(task_par)
            console.log("done with:-", task_par)
            console.log(document.getElementById(`task-btn${taskKey}`))
        });
        console.log("done with:-", lists)
    }
}

async function makeSubGroupTree() {
    type Grps = Record<string, any[]>;
    let grps = await eel.listGroupDict()() as Grps
    let grps_htm = document.getElementById('groups') as HTMLElement || null;
    if (grps_htm){
        Object.entries(grps).forEach(([grp, subgrps]) => {
            let group_par = document.createElement('div')
            group_par.classList = 'group'

            let group_title = document.createElement('div')
            group_title.classList = 'group-title'
            group_title.innerText = grp

            let subgroup_btn_par = document.createElement('div')
            subgroup_btn_par.classList = 'subgroup-wrap'
            subgroup_btn_par.onclick = () => {
                makeNewSubGroup(grp)
            }

            let content = document.createElement('div')
            content.classList = 'tab-content'

            let span = document.createElement('span')
            span.classList = 'material-symbols-outlined sub-icon'
            span.innerText = 'add'


            let span_desc = document.createElement('div')
            span_desc.classList = 'subtab-description'
            span_desc.innerText = 'New sub group'

            content.appendChild(span)
            content.appendChild(span_desc)
            subgroup_btn_par.appendChild(content)

            group_par.appendChild(group_title)
            group_par.appendChild(subgroup_btn_par)
            
            let subgrp_par = document.createElement('div')
            subgrp_par.classList = 'group-tabs'

            subgrps.forEach((subgrp: string, key: Number) => {
                let subgrp_desc = document.createElement('div')
                subgrp_desc.classList = 'tab-description'
                subgrp_desc.id = `desc${key}`
                subgrp_desc.dataset.grp = grp
                subgrp_desc.dataset.subgrp = subgrp
                subgrp_desc.onclick = async() => {
                    let val = await eel.listCatItems(subgrp_desc.dataset.grp, subgrp_desc.dataset.subgrp)()
                    console.log(val)
                    list_items(val)
                }

                let subgrp_ico = document.createElement('span')
                subgrp_ico.classList = 'material-symbols-outlined'
                subgrp_ico.innerText = 'tag'

                let subgrp_name = document.createTextNode(subgrp)

                subgrp_desc.appendChild(subgrp_ico)
                subgrp_desc.appendChild(subgrp_name)

                subgrp_par.appendChild(subgrp_desc)
            })
            group_par.appendChild(subgrp_par)
            grps_htm.appendChild(group_par)
        });
    }
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

function makeNewSubGroup(catagory: string) {
    const input = document.getElementById("context-input") as HTMLInputElement
    input.type = "text";
    console.log("showing context...");
    let value = ""
    const text = "Enter the name of the new subgroup"
    const el = document.querySelector("#hide-all") as HTMLElement | null;
    const description = document.getElementById("context-description");
    if (el && description) {
        el.style.display = "block"
        description.innerHTML = text
        input.addEventListener("keydown", async(e) => {
            if (e.key == "Enter") {
                el.style.display = "none";
                let value = input.value;
                input.value= "";
                await eel.newSubGroup(catagory, value)
            }
        })
    }
}

function makeChart(){
    console.log('here')
    const canvas = document.getElementById('myChart') as HTMLCanvasElement | null;
    if (canvas) {
        console.log('here')
        const config: import('chart.js').ChartConfiguration<'bar'> =  {
            type: 'bar',
            data: {
                labels: [
                    'Sun',
                    'Mon',
                    'Tue'
                ],
                datasets: [{
                    label: 'Progress (%)',
                    data: [10, 20, 30],
                    borderRadius: 10,
                    borderWidth: 2,
                    borderSkipped: false,
                    backgroundColor: 'rgba(0, 0, 0, 1)'
                }]
            },
            options: {
                indexAxis: 'x',
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0)'
                        }
                    },
                    y: {
                        max: 100,
                        grid: {
                            color: 'rgb(137, 234, 171)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                    }
                }
            }
        }
        console.log('here')
        const _ = new Chart(canvas, config);
        console.log('here')
    }
}

window.makeNewSubGroup = makeNewSubGroup;

