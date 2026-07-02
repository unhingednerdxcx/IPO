document.addEventListener("DOMContentLoaded", main); // only after the DOM tree has been loaded, run main
declare const Chart: typeof import('chart.js').Chart; // import Chart from chart.js
import { listTodaysChallange, increaseXP, decreaseXP, updateInfo, listCompletedTasks, setTask } from "./signinx.js" 

/* 
    in TS whenever fetching any element, we do:-
        let el = document.getElementById("myel") as HTMLElement || null
        if (el) {
            console.log("I exist!")
        }
        
        basically, 'as HTMLElement || null' means, represent the result as HTMLElement tyoe
        or null if its not possible to store the data as HTMLElement.
        if (el) checks if the result was null (null is falsy in TS). if it was null, that means element dosent exist.
*/
const eel = (window as any).eel; // use eel
if (!eel) {
    window.location.reload() // reload if there is no eel
}
declare global {
  interface Window {
    makeNewSubGroup: (catagory: string) => void;
  }
}

type challangeData = { // this will store the challanges
  Tasks: string[];
  XP: Number[];
};

type item = [ // this will store the context data (you will see soon)
    string,
    () => void,
    string
]


let current = "Default"; // store the current scene
let current_tab = "."    // store the current tab
let current_routine = "" // store the current routine open

let click_need = false       // if the clicks something, we need to hide an element,
let click_kind: HTMLElement; // this var determines which element will my listener hide


let chart: any = ""
let config: import('chart.js').ChartConfiguration<'bar'> = await eel.routineDetailConfig()() // get config from py
const canvas = document.getElementById('routineChart') as HTMLCanvasElement || null; // get the canvas element or return null
if (canvas) { // if canvas DOES exist
    chart = new Chart(canvas, config); // store the config 
}

async function main() {
    document.getElementById("side-search")?.addEventListener("click", async() => {
        let value = await showContext("Enter the task you want to search for", 'text')
        let search_val = await eel.searchTask(value)()
        searchBoxShow(search_val, String(value))
    });

    document.getElementById('side-routine')?.addEventListener('click', routine_population);

    document.getElementById('add-new-step')?.addEventListener('click', async() => {
        let name = await showContext('Enter name of the new task')
        let tasks = await eel.listTasks(current_routine)()
        let pos = await showContext('After which task would you like to place this task', 'dropdown', tasks)
        await eel.appendRoutineTask(pos, current_routine, name)()
        console.log(pos, tasks)
    })

    document.getElementById("side-challange")?.addEventListener('click', async() => {
        let val = await listTodaysChallange() as challangeData
        side_mainFunc("Today", 'side-challange', async() => {
            if (val) {
                let check: Boolean[] = await listCompletedTasks()
                let res = await eel.challangeinfo(val, check)()
                list_items(res, true)
            }
        })
    })



    document.getElementById("side-new-task")?.addEventListener("click", async() => {
        let name = await showContext("Enter the name of the new task", 'text')
        let date: any = await showContext("Enter the date of the new task", 'date')
        let time: any = await showContext("Enter the time of the new task", 'time')
        let grp: any = await showContext("Which group show we store the task in", 'text')
        let subgrp: any = await showContext("Which subgroup show we store the task in", 'text')
        const dateTime = new Date(`${date}T${time}`)
        if (await eel.validateDateTime(dateTime.toISOString())()) {
            date = date.split('-')
            time = time.split(':')
            eel.addTask(name, grp, subgrp, `${date[0]}/${date[1]}/${date[2]}/${time[0]}/${time[1]}`)
        }
    });

    document.getElementById('new-routine')?.addEventListener('click', async() => {
        let name = await showContext("Enter the name of the new routine", 'text')
        let time = await showContext("Select how often this routine is", 'dropdown', ["Daily", "Weekly", "Monthly"], 'Select')
        eel.addRoutine(time, name)()
    })

    document.getElementById('more-acc-info')?.addEventListener('click', async(e) => {
        let context = document.getElementById("acc-context")
        if (context){
            updateInfo()
            let x = e.clientX
            let y = e.clientY - 150
            context.style.left = String(`${x}px`)
            context.style.top = String(`${y}px`)
            context.style.display = 'flex'
            setTimeout(() => {
            click_need = true
            click_kind = context}, 20)
        }
    })

    document.getElementById('colorize')?.addEventListener('click', async() => {
        let color = await showContext("Select color", "dropdown", ["Red", "Orange", "Yellow", "Green", "Blue", "Purple"], "colors...")
        color = color.toLowerCase()
        await eel.changeColor(color)()
        setColors()
    })

    document.getElementById("side-Today")?.addEventListener('click', async() => {
        side_mainFunc("Today", 'side-Today',  async() => {
            let val = await eel.listTask("", "", "today")()
            list_items(val)
        })
    });
    document.getElementById("side-upcoming")?.addEventListener('click', async() => {
        side_mainFunc("Today", 'side-upcoming', async() => {
            let val = await eel.listTask("", "", "upcomming")()
            list_items(val)
        })
    });

    document.getElementById('side-group')?.addEventListener('click', async() => {
        let value = await showContext("Enter the new group you want to make", 'text')
        await eel.addNewGroup(value)
        makeSubGroupTree()
    })

    makeSubGroupTree()
    await setColors()
    const primary_highlight_color = getComputedStyle(document.documentElement).getPropertyValue('--primary-highlight-color').trim()
    // because of TypeScripts strict syntax, this extremly-nested if condition was made
    if (config.options) {
        if (config.options.scales) {
            if (config.options.scales.y) {
                if (config.options.scales.y.grid) {
                    if (config.options.scales.y.grid.color) {
                        config.options.scales.y.grid.color = primary_highlight_color
                    }
                }
            }
        }
    }
}


async function routine_population() {
    let routine = document.getElementById('routine') as HTMLElement || null;
    let current_el = document.getElementById(`${current}`) as HTMLElement || null
    let all_el = document.getElementById('all-routine') as HTMLElement || null
    let tab_el = document.getElementById(current_tab) as HTMLElement || null
    let this_el = document.getElementById('side-routine') as HTMLElement || null
    if (routine && current_el && all_el && this_el) {
        current_el.style.display = "none"
        if (tab_el) {
            tab_el.classList.remove('active')
        }
        current_tab = "side-routine"
        this_el.classList.add('active')
        if (current == "Default") {
            let el = document.getElementById('Today') as HTMLElement || null
            if (el) {
                el.style.display = "none"
            }
        }
        all_el.style.display = "flex"
        current = "all-routine"
        routine.style.display = "flex"

        let val = await eel.listAllRoutineNames()()
        let pos = 0
        let once = false

        val.forEach( async(task: any, index: number) => {
            let routine = document.getElementById(`${task[0]}-routines`) as HTMLElement || null
            if (routine) {
                routine.innerHTML = ''
                let info = await eel.listRoutineTraits(task[0], task[1])()

                function quickHtml(type: string, classes="", innerText="") {
                    let el = document.createElement(type)
                    el.classList = classes
                    if (innerText != "") {
                        el.innerText = innerText
                    }
                    return el
                }

                let li = quickHtml("li", "routine-block")
                li.dataset.path = `${task[0]}/${task[1]}/${index}`

                let main_info = quickHtml('div', "routine-block-text")

                let main_info_title = quickHtml('div', "routine-block-title", task[1])

                let main_info_descript = quickHtml('div', "routine-block-summary")

                let main_info_descript_hardest = quickHtml('div', "", `Hardest task: ${info['Most difficult'].name}`)

                let main_info_descript_easiest = quickHtml('div', "", `Easiest task: ${info['Most easiest'].name}`)
                
                let streak = document.createTextNode(`Day: ${info.Streak} Killing it!`)
                let chart_par = quickHtml('div', 'summary-chart-container')

                let graph = quickHtml('canvas', 'routine-block-graph') as HTMLCanvasElement
                graph.id = `graph${index}`

                let labels: any = {
                    "daily": ['Sun', 'Tue', 'Thu', 'Sat'],
                    "weekly": ['W1', 'W2', 'W3', 'W4'],
                    "monthly": ['Jan', 'May', 'Sept', 'Dec']
                }
                let fix_dataPoints: any = []
                let label: String[] = []
                switch (task[0]) {
                    case "daily": {
                        label = labels['daily']
                        fix_dataPoints = [info['consistancy'][0], info['consistancy'][2], info['consistancy'][4], info['consistancy'][6]]
                        once = true
                        break;
                    }
                    case "weekly": {
                        if (once) {
                            pos = 0
                            once = false
                        }
                        label = labels['weekly']
                        fix_dataPoints = info['consistancy']
                        break;
                    }
                    case "monthly": {
                        if (once) {
                            pos = 0
                            once = false
                        }
                        label = labels['monthly']
                        fix_dataPoints = [info['consistancy'][0], info['consistancy'][4], info['consistancy'][8], info['consistancy'][11]]
                        break;
                    }
                }
                li.onclick = () => {
                    showroutinedetails(String(li.dataset.path), pos)
                }
                const primary_highlight_color = getComputedStyle(document.documentElement).getPropertyValue('--primary-highlight-color').trim()
                
                let config: import('chart.js').ChartConfiguration<'line'> = await eel.routineSummaryConfig(label, fix_dataPoints, primary_highlight_color)()

                let chart: any = ""
                if (canvas) {
                    chart = new Chart(graph, config);
                }

                main_info_descript.appendChild(main_info_descript_hardest)
                main_info_descript.appendChild(main_info_descript_easiest)
                main_info_descript.appendChild(streak)

                main_info.appendChild(main_info_title)
                main_info.appendChild(main_info_descript)

                chart_par.appendChild(graph)

                li.appendChild(main_info)
                li.appendChild(chart_par)


                li.oncontextmenu = (e) => {
                    e.preventDefault()
                    const li = (e.currentTarget as HTMLElement);

                    let more = document.createElement('span')
                    let path = li.dataset.path?.split('/')
                    console.log(path)
                    if (path) {
                        let formated = `${path[0]}/${path[2]}/${path[1]}`
                        console.log(li)
                        more.dataset.path = formated
                    }
                    more_func([
                        ['Delete routine', routine_del, 'delete'],
                        ['Rename routine', routine_rename, 'edit'],
                    ], e, more)
                }

                routine.appendChild(li)
            }
        })
    }
}

async function showroutinedetails(path: string, pos: Number) {
    const current_element = document.getElementById(`${current}`) as HTMLElement | null;
    const el = document.getElementById("routine-stats") as HTMLElement || null;
    const title = document.getElementById('routine-stat-title') as HTMLElement || null;
    const diff = document.getElementById('most-difficult-task') as HTMLElement|| null;
    const easy = document.getElementById('most-easiest-task') as HTMLElement || null 
    const streak = document.getElementById('streak') as HTMLElement || null;
    const path_arr = path.split('/')
    const canvas = document.getElementById('routineChart') as HTMLCanvasElement | null;
    const data = await eel.listRoutineTraits(path_arr[0], path_arr[1])()

    if (el && title && diff && easy && streak && canvas && path_arr && current_element) {
        current_element.style.display = "none"
        current = "routine-stats"
        el.style.display = 'block'
        title.innerText = String(path_arr[1])
        current_routine = String(path_arr[1])
        diff.innerText = data['Most difficult'].name
        easy.innerText = data['Most easiest'].name
        streak.innerText = data.Streak
        let labels: any = {
            "daily": ['Sun', 'Mon', 'Tue', 'Thu', 'Fri', 'Sat'],
            "weekly": ['W1', 'W2', 'W3', 'W4'],
            "monthly": ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
        }
        let label: String[] = []
        switch (path_arr[0]) {
            case "daily": {
                label = labels['daily']
                break;
            }
            case "weekly": {
                label = labels['weekly']
                break;
            }
            case "monthly": {
                label = labels['monthly']
                break;
            }
        }
        config.data.labels = label;
        (config as any).data.datasets[0].data = data['consistancy']
        chart.update()
        populate_routine_tasks(data['tasks'], data["Complete till"], path_arr[0], pos, path_arr[1])
    }
}


function populate_routine_tasks(tasks: Array<String>, complete: string, time: any, pos: any, title: any) {
    let complete_reach = true
    let tree = document.getElementById('routine-task-tree') as HTMLElement || null
    if (tree){
        tree.innerHTML = ""
        tasks.forEach((task: String, index: number) => {
            let li = document.createElement('li')
            li.classList = 'routine-step'

            let btn = document.createElement('div')
            btn.classList = 'routine-task-button'
            btn.dataset.name = String(task)
            btn.dataset.complete = 'false'

            let desc = document.createElement('div')
            desc.classList = 'routine-discript'
            desc.innerText = String(task)

            console.log(complete)

            if (complete != "") {
                if (task == complete) {
                    complete_reach = false
                    btn.dataset.complete = 'true'
                    setComplete(btn)
                } else if (complete_reach) {
                    btn.dataset.complete = 'false'
                    setComplete(btn)
                }
            } else {
                btn.dataset.complete = 'false'
                complete_reach = false
            }

            btn.onclick = () => {
                if (btn.dataset.complete == 'false') {
                    setComplete(btn)
                    btn.dataset.complete = 'true'
                    eel.setComplete(`${time}/${pos}/${btn.dataset.name}/${title}`)
                }
            }

            function setComplete(btn: HTMLElement) {
                let check = document.createElement('span')
                check.classList = "material-symbols-outlined routine-complete-icon"
                check.innerText = 'check'
                btn.appendChild(check)
            }
            
            let more = document.createElement('span')
            more.classList  = "material-symbols-outlined routine-task-more"
            more.innerText = "more_horiz"
            more.dataset.path = `${time}/${pos}/${title}/${index}`
            more.dataset.moreinfo = `${time}/${title}\\${pos}`

            more.onclick = (e) => {
                more_func([
                    ["Delete", routine_task_del, "delete"],
                    ["Rename", routine_task_rename, "edit"],
                    ["Move up", routine_task_changePos_up, "move_up"],
                    ["Move down", routine_task_changePos_down, "move_down"]
                ], e, more)
            }

            li.appendChild(btn)
            li.appendChild(desc)
            li.appendChild(more)
            tree.appendChild(li)
        })
    }
}


function side_mainFunc(par_el: string, this_tab_name: string, func: Function) {
    const par = document.getElementById(par_el) as HTMLElement || null;
    const current_element = document.getElementById(current) as HTMLElement | null;
    const tab_el = document.getElementById(current_tab) as HTMLElement || null
    const this_tab_el = document.getElementById(this_tab_name) as HTMLElement || null
    if (par && current_element && this_tab_el) {
        if (tab_el) {
            tab_el.classList.remove('active')
        }
        current_tab = this_tab_name
        this_tab_el.classList.add('active')
        current = par_el
        current_element.style.display = "none"
        par.style.display = "flex"
        func()
    }
}

async function setColors() {
    let colorTheme = await eel.getColors()()
    Object.entries(colorTheme).forEach((arr: any) => {
        document.documentElement.style.setProperty(`--${arr[0]}`, arr[1])
    });
}



async function ctx_delete() {
    await eel.delete(document.getElementById("more-task-info")?.dataset.path)()
}

async function ctx_rename() {
    let newName = await showContext('Enter new name')
    await eel.rename(document.getElementById("more-task-info")?.dataset.path, newName)()
}

async function ctx_dead() {
    let time = await showContext("Enter new time", 'time')
    let date = await showContext("Enter new date", 'date')
    await eel.dead(document.getElementById("more-task-info")?.dataset.path, time, date)()
}

async function ctx_info(){
    let msg = await eel.info(document.getElementById("more-task-info")?.dataset.path)()
    let box = document.getElementById('msg-box') as HTMLElement || null
    if (box) {
        box.innerText = msg
        console.log(msg)
        box.classList.add('active')
        setTimeout(() => {
            box.classList.remove('active')
        }, 4000)
    }
}

async function routine_del() {
    await eel.delRoutine(document.getElementById("more-task-info")?.dataset.path)
    routine_population()
}

async function routine_rename() {
    let newName = await showContext("Enter new name")
    await eel.routineRename(document.getElementById("more-task-info")?.dataset.path, newName)
    routine_population()

}

async function routine_task_del() {
    await eel.delRoutineTask(document.getElementById("more-task-info")?.dataset.path)()
    let path = document.getElementById("more-task-info")?.dataset.moreinfo?.split("\\")
    if (path) {
        showroutinedetails(String(path[0]), Number(path[1]))
    }
}
 
async function routine_task_rename() {
    let newName = await showContext("Enter new name")
    await eel.routineTaskRename(document.getElementById("more-task-info")?.dataset.path, newName)()
    let path = document.getElementById("more-task-info")?.dataset.moreinfo?.split("\\")
    if (path) {
        showroutinedetails(String(path[0]), Number(path[1]))
    }
}

async function routine_task_changePos_up() {
    await eel.changeRoutineTaskPosition(document.getElementById("more-task-info")?.dataset.path, "up")()
    let path = document.getElementById("more-task-info")?.dataset.moreinfo?.split("\\")
    if (path) {
        showroutinedetails(String(path[0]), Number(path[1]))
    }
}

async function routine_task_changePos_down() {
    await eel.changeRoutineTaskPosition(document.getElementById("more-task-info")?.dataset.path, "down")()
    let path = document.getElementById("more-task-info")?.dataset.moreinfo?.split("\\")
    if (path) {
        showroutinedetails(String(path[0]), Number(path[1]))
    }
}

async function more_func(arr: item[], e: MouseEvent, more: HTMLElement) {
    let ctx = document.getElementById("more-task-info")
    if (ctx) {
        ctx.innerHTML = ""
        arr.forEach((val) => {
            let option = document.createElement('div')
            option.classList = "more-cts-info"
            option.onclick = val[1]

            let icon = document.createElement('span')
            icon.classList = "material-symbols-outlined more-cts-ico"
            icon.innerText = String(val[2])

            let text = document.createTextNode(String(val[0]))

            option.appendChild(icon)
            option.appendChild(text)
            ctx.appendChild(option)
        })
        ctx.style.top = `${String(e.clientY)}px`
        ctx.style.left = `${String(e.clientX)}px`
        ctx.style.display = "flex"
        Object.assign(ctx.dataset, more.dataset)
        setTimeout(() => {
            click_need= true
            click_kind = ctx
        }, 20)
    }
}

async function group_del() {
    let path = document.getElementById("more-task-info")?.dataset.path
    await eel.delGroup(path)()
    await makeSubGroupTree()
}

async function group_rename() {
    let path = document.getElementById("more-task-info")?.dataset.path
    let newName = await showContext("Enter new name")
    eel.renameGroup(path, newName)()
    await makeSubGroupTree()
}

async function sub_group_del() {
    let path = document.getElementById("more-task-info")?.dataset.path
    await eel.delSubGroup(path)()
    await makeSubGroupTree()
}

async function sub_group_rename() {
    let path = document.getElementById("more-task-info")?.dataset.path
    let newName = await showContext("Enter new name")
    eel.renameSubGroup(path, newName)()
    await makeSubGroupTree()
}

async function list_items(tasks: Array<any>, challange=false) {
    let lists = document.getElementById('tasks') as HTMLElement|| null
    let today = document.getElementById('Today') as HTMLElement || null
    let nothing = document.getElementById('nothingHere') as HTMLElement || null
    if (tasks && lists && today) {
        lists.innerHTML = ''
        let taskKey = 0
        let margin = document.createElement('div')
        margin.style.height = '2vh'
        lists.appendChild(margin)
        tasks.forEach(task => {
            taskKey += 1
            let task_par = document.createElement('li')
            task_par.classList = 'task'
            task_par.dataset.path = task[1]
            task_par.id = `task_par${taskKey}`

            let task_btn = document.createElement('button')
            task_btn.classList = 'toggle-task'
            task_btn.id = `task-btn${taskKey}`
            task_btn.onclick = async() => {
                toggle(task_btn.id, challange)
            }

            async function setcheck(key: any) {
                key = String(key)
                let icon = document.getElementById(`task_ico${key}`) as HTMLElement || null
                let task_par = document.getElementById(`task_par${key}`) as HTMLElement || null
                let task_desc = document.getElementById(`task_desc${key}`) as HTMLElement || null
                if (icon && task_par && task_desc) {
                    let path = task_par.dataset.path
                    let donestatus = await eel.donestatus(`${path}/${task_desc.innerText}`)()
                    if (!donestatus) {
                        icon.innerText = ""
                    } else {
                        icon.innerText = "check_small"
                    }
                }
            }

            async function toggle(id: String, challange: boolean){
                let key = id.split('task-btn')[1]
                let icon = document.getElementById(`task_ico${key}`) as HTMLElement || null
                let task_par = document.getElementById(`task_par${key}`) as HTMLElement || null
                if (icon && task_par) {
                    if (icon.innerText == "check_small") {
                        icon.innerText = ""
                        if (challange) {
                            if (task_par.dataset.path) {
                                await decreaseXP(Number(task_par.dataset.path))
                            }
                            setTask(Number(key) -1, false)
                            return
                        }
                        eel.toggletask(`${task_par.dataset.path}/${task_desc.innerText}`, false)
                    } else {
                        icon.innerText = "check_small"
                        if (challange) {
                            if (task_par.dataset.path) {
                                await increaseXP(Number(task_par.dataset.path))
                            }
                            setTask(Number(key) -1, true)
                            return
                        }
                        eel.toggletask(`${task_par.dataset.path}/${task_desc.innerText}`, true)
                    }
                }
            }


            let ico = document.createElement('span')
            ico.classList = 'material-symbols-outlined default-icon check-task'
            ico.id = `task_ico${taskKey}`

            let task_desc = document.createElement('span')
            task_desc.classList = "task-description"
            task_desc.innerText = String(task[0])
            task_desc.id = `task_desc${taskKey}`
            task_btn.appendChild(ico)
            task_par.appendChild(task_btn)
            task_par.appendChild(task_desc)
            if (!challange) {
                let more = document.createElement('span')
                more.classList = "material-symbols-outlined moreTask"
                more.innerText = "more_horiz"
                more.dataset.path = `${task[1]}/${task[0]}`
                task_par.appendChild(more)
                setcheck(taskKey)
                more.onclick = async(e) => {
                    more_func([
                        ['Delete task', ctx_delete, 'delete'],
                        ['Rename task', ctx_rename, 'edit'],
                        ['Change deadline task', ctx_dead, 'timer'],
                        ['Task info', ctx_info, 'info'],
                    ], e, more)
                }
            }
            lists?.appendChild(task_par)
            if (challange) {
                if (tasks[taskKey-1]![2]) {
                    let ico = document.getElementById(`task_ico${taskKey}`) as HTMLElement || null
                    if (ico) {
                        ico.innerText = "check_small"
                    }
                }
            }
        });
        if (taskKey == 0) {
            today.style.display = 'none'
            nothing.style.display = 'flex'
            current = "nothingHere"
        }
    }
}

async function makeSubGroupTree() {
    type Grps = Record<string, any[]>;
    let grps = await eel.listGroupDict()() as Grps
    let grps_htm = document.getElementById('groups') as HTMLElement || null;
    if (grps_htm){
        grps_htm.innerHTML = ""
        Object.entries(grps).forEach(([grp, subgrps]) => {
            let group_par = document.createElement('div')
            group_par.classList = 'group'

            let group_title = document.createElement('div')
            group_title.classList = 'group-title'
            group_title.innerText = grp

            let subgroup_btn_par = document.createElement('div')
            subgroup_btn_par.classList = 'subgroup-wrap'

            let content = document.createElement('div')
            content.classList = 'sub-content'

            let span = document.createElement('span')
            span.classList = 'material-symbols-outlined sub-icon'
            span.innerText = 'add'


            let span_desc = document.createElement('div')
            span_desc.classList = 'new-sub-grp'
            span_desc.innerText = 'New sub group'

            content.appendChild(span)
            content.appendChild(span_desc)
            subgroup_btn_par.appendChild(content)


            let more = document.createElement('span')
            more.classList = "material-symbols-outlined group-more"
            more.innerText = "more_horiz"
            more.dataset.path = grp
            more.onclick = async(e) => {
                more_func([
                    ['Delete group', group_del, 'delete'],
                    ['Rename group', group_rename, 'edit'],
                ], e, more)
            }

            group_title.appendChild(more)
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
                    let fmt_val: any[] = []
                    val.forEach((task: any) => {
                        fmt_val.push([task, `${grp}/${subgrp}`])
                    })

                    const today = document.querySelector("#Today") as HTMLElement | null;
                    const current_element = document.getElementById(`${current}`) as HTMLElement | null;
                    if (today && current_element) {
                        current_element.style.display = "none"
                        today.style.display = "flex"
                        current= "Today"
                        list_items(fmt_val)
                    }
                }

                let subgrp_ico = document.createElement('span')
                subgrp_ico.classList = 'material-symbols-outlined'
                subgrp_ico.innerText = 'tag'

                let subgrp_name = document.createTextNode(subgrp)

                let more = document.createElement('span')
                more.classList = "material-symbols-outlined sub-group-more"
                more.innerText = "more_vert"
                more.dataset.path = `${grp}/${subgrp}`
                more.onclick = async(e) => {
                    await more_func([
                        ['Delete subgroup', sub_group_del, 'delete'],
                        ['Rename subgroup', sub_group_rename, 'edit'],
                    ], e, more)
                    await makeSubGroupTree()
                }

                subgrp_desc.appendChild(subgrp_ico)
                subgrp_desc.appendChild(subgrp_name)
                subgrp_desc.appendChild(more)

                subgrp_par.appendChild(subgrp_desc)
            })
            group_par.appendChild(subgrp_par)
            grps_htm.appendChild(group_par)
        });
    }
}

async function makeNewSubGroup(catagory: string) {
    let value = await showContext("Enter the name of the new subgroup", 'text')
    await eel.newSubGroup(catagory, value)
    makeSubGroupTree()
}



document.addEventListener('click', (e)=>{
    if (click_need) {
        click_kind.style.display = 'none'
        click_need = false
    }
})

document.addEventListener('keydown', async(e) => {
    if (e.altKey && /^[1-4]$/.test(e.key)) {
        e.preventDefault()
        switch (e.key) {
            case "1": {
                side_mainFunc("Today", 'side-Today',  async() => {
                    let val = await eel.listTask("", "", "today")()
                    list_items(val)
                })
                break;
            }
            case "2": {
                side_mainFunc("Today", 'side-upcoming', async() => {
                    let val = await eel.listTask("", "", "upcomming")()
                    list_items(val)
                })
                break;
            }
            case "3": {
                routine_population()
                break;
            }
            
            case "4": {
                let val = await listTodaysChallange() as challangeData
                side_mainFunc("Today", 'side-challange', async() => {
                    if (val) {
                        let check: Boolean[] = await listCompletedTasks()
                        let res = await eel.challangeinfo(val, check)()
                        list_items(res, true)
                    }
                })
                break;
            }
        }
    }
    else if (e.ctrlKey && e.key === "t") {
        e.preventDefault()
        let name = await showContext("Enter the name of the new task", 'text')
        let date: any = await showContext("Enter the date of the new task", 'date')
        let time: any = await showContext("Enter the time of the new task", 'time')
        let grp: any = await showContext("Which group show we store the task in", 'text')
        let subgrp: any = await showContext("Which subgroup show we store the task in", 'text')
        const dateTime = new Date(`${date}T${time}`)
        if (await eel.validateDateTime(dateTime.toISOString())()) {
            date = date.split('-')
            time = time.split(':')
            eel.addTask(name, grp, subgrp, `${date[0]}/${date[1]}/${date[2]}/${time[0]}/${time[1]}`)
        }
    }
    else if (e.ctrlKey && e.shiftKey && e.key === "R" ) {
        e.preventDefault()
        let name = await showContext("Enter the name of the new routine", 'text')
        let time = await showContext("Select how often this routine is", 'dropdown', ["Daily", "Weekly", "Monthly"], 'Select')
        eel.addRoutine(time, name)()
    }
    else if (e.ctrlKey && e.key === "f") {
        e.preventDefault()
        let value = await showContext("Enter the task you want to search for", 'text')
        let search_val = await eel.searchTask(value)()
        searchBoxShow(search_val, String(value))
    }

    else if (e.ctrlKey && e.key == "/") {
        let box = document.getElementById('key-box') as HTMLElement || null
        if (box) {
            box.style.display = "flex"
            let handler =  (e: KeyboardEvent) => {
                if (e.key === "Escape") {
                    box.style.display = "none"
                    document.removeEventListener("keydown", handler)
                }
            }
            document.addEventListener("keydown", handler)
        }
    }
})

export function showContext(descriptions: string, type="text", val: any[] =[], disc_2=""): Promise<any> {
    return new Promise((resolve) => {
        const hide = document.getElementById('hide-all') as HTMLElement || null
        const desc = document.getElementById("context-description") as HTMLElement || null
        const input = document.getElementById("context-input") as HTMLInputElement || null
        if (hide && desc && input) {
            hide.style.display = 'flex'
            desc.innerText = descriptions
            input.type = type
            let mode: string;
            let key_handle = (e: any)=> {
                if (e.key == "Enter") {
                    resolve(input.value)
                    input.removeEventListener(mode, key_handle)
                    hide.style.display = "none"
                }
            }
            let handle = (e: any)=> {
                resolve(input.value)
                input.removeEventListener(mode, handle)
                hide.style.display = "none"
            }

            let drop_handle = () => {
                let drop_icon = document.getElementById('drop-arr') as HTMLElement || null
                let drop_ops = document.getElementById('drop-ops') as HTMLElement || null
                drop_icon.style.rotate = drop_icon.style.rotate =="90deg" ? "0deg" : "90deg"
                drop_ops.style.display = drop_ops.style.display=="flex" ? "none" : "flex" 

                let drop = document.getElementById('dropdown') as HTMLElement || null
                drop.style.display = 'flex'
            }

            let file_handle = (e: Event) => {
                let target = e.target as HTMLInputElement
                const files = target.files
                if (files) {
                    resolve(files[0])
                }
            }

            if (type == "text") {
                mode = "keydown"
                input.addEventListener(mode, key_handle);
            } else if (type == "time" || type == "date") {
                mode = "change"
                input.addEventListener(mode, handle);
            } else if (type == "dropdown") {
                let mode = "click"
                let drop = document.getElementById('dropdown') as HTMLElement || null
                let drop_title = document.getElementById('drop-title') as HTMLElement || null
                let drop_icon = document.getElementById('drop-arr') as HTMLElement || null
                let drop_ops = document.getElementById('drop-ops') as HTMLElement || null
                if (drop && drop_title && drop_icon && drop_ops) {
                    drop_ops.innerHTML = ""
                    input.style.display = 'none'
                    drop.style.display = 'flex'
                    drop_title.innerText = disc_2
                    val.forEach((option) =>  {
                        let li = document.createElement('li')
                        li.innerText = option
                        li.onclick = () => {
                            drop.style.display = 'none'
                            input.style.display ='inherit'
                            hide.style.display = "none"
                            resolve(li.innerText)
                        }
                        drop_ops.appendChild(li)
                    })
                    drop_icon.addEventListener(mode, drop_handle);
                }
            } else if(type == "file") {
                mode = "change"
                input.addEventListener(mode, file_handle);
            }
        }
    })
}

function searchBoxShow(searches: Object, value: string ) {
    let hideall = document.getElementById("hide-all-search") as HTMLElement || null
    if (hideall) {
        hideall.style.display = "flex"
        let title = document.getElementById('search-title') as HTMLElement || null
        title.innerText = `Searching for: ${value}`

        let results_par = document.getElementById('search-ress') as HTMLElement || null
        results_par.innerHTML = ""
        Object.entries(searches).forEach(([k, v]) => {
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
window.makeNewSubGroup = makeNewSubGroup;

