document.addEventListener("DOMContentLoaded", main);
declare const Chart: typeof import('chart.js').Chart;
import { listTodaysChallange, increaseXP, decreaseXP, updateInfo, listCompletedTasks, setTask } from "./signinx.js"

declare global {
  interface Window {
    makeNewSubGroup: (catagory: string) => void;
  }
}

type challangeData = {
  Tasks: string[];
  XP: Number[];
};


let current = "Default";
let current_tab = "."


let esc_need = false
let esc_kind: HTMLElement;
let click_need = false
let click_kind: HTMLElement;


let chart: any = ""
let config: import('chart.js').ChartConfiguration<'bar'> = {
    type: 'bar',
    data: {
        labels: [],
        datasets: [{
            label: 'Progress (%)',
            data: [],
            borderRadius: 10,
            borderWidth: 2,
            borderSkipped: false,
            backgroundColor: 'rgba(0, 0, 0, 0.56)'
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
            tooltip: {
                backgroundColor: '#33333380',
                titleColor: '#ffffff',
                bodyColor: '#ffffff',
                footerColor: '#70f67079',
                borderColor: '#33333387',
                borderWidth: 1,
                displayColors: true,
                boxPadding: 3
            },
            legend: {
                display: true,
                position: 'top',
            }
        }
    }
};
const canvas = document.getElementById('routineChart') as HTMLCanvasElement | null;
if (canvas) {
    chart = new Chart(canvas, config);
}


const eel = (window as any).eel;
if (!eel) {
    window.location.reload()
}


async function main() {
    document.getElementById("side-search")?.addEventListener("click", async() => {
        let value = await showContext("Enter the task you want to search for", 'text')
        let search_val = await eel.searchTask(value)()
        searchBoxShow(search_val, String(value))
    });

    document.getElementById('side-routine')?.addEventListener('click', async() => {
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
            let key = 0
            let pos = 0
            let once = false
            val.forEach( async(task: any) => {
                key += 1
                let routine = document.getElementById(`${task[0]}-routines`) as HTMLElement || null
                if (routine) {
                    routine.innerHTML = ''
                    let info = await eel.listRoutineTraits(task[0], task[1])()

                    let li = document.createElement('li')
                    li.classList = "routine-block"
                    li.dataset.path = `${task[0]}/${task[1]}`

                    let main_info = document.createElement('div')
                    main_info.classList = "routine-block-text"

                    let main_info_title = document.createElement('div')
                    main_info_title.classList = "routine-block-title"
                    main_info_title.innerText = task[1]

                    let main_info_descript = document.createElement('div')
                    main_info_descript.classList = "routine-block-summary"

                    let main_info_descript_hardest = document.createElement('div')
                    main_info_descript_hardest.innerText = `Hardest task: ${info['Most difficult'].name}`
                    let main_info_descript_easiest = document.createElement('div')
                    main_info_descript_easiest.innerText = `Hardest task: ${info['Most easiest'].name}`
                    let streak = document.createTextNode(`Day: ${info.Streak} Killing it!`)


                    let chart_par = document.createElement('div')

                    let graph = document.createElement('canvas')
                    graph.id = `graph${key}`
                    chart_par.classList = 'routine-block-graph'

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
                    let config: import('chart.js').ChartConfiguration<'line'> = {
                        type: 'line',
                        data: {
                            labels: label,
                            datasets: [{
                                label: 'Progress (%)',
                                data: fix_dataPoints,
                                borderWidth: 2,
                                backgroundColor: 'rgba(0, 0, 0, 0.56)'
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
                                        color: primary_highlight_color
                                    }
                                }
                            },
                            plugins: {
                                tooltip: {
                                    enabled: false,
                                },
                                legend: {
                                    display: false,
                                }
                            }
                        }
                    };

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

                    routine.appendChild(li)
                }
                });
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
                tasks.forEach((task: String) => {
                    let li = document.createElement('li')
                    li.classList = 'routine-step'

                    let btn = document.createElement('div')
                    btn.classList = 'routine-task-button'
                    btn.dataset.name = String(task)
                    btn.dataset.complete = 'false'

                    let desc = document.createElement('div')
                    desc.classList = 'routine-discript'
                    desc.innerText = String(task)

                    if (task == complete) {
                        complete_reach = false
                        btn.dataset.complete = 'true'
                        setComplete(btn)
                    } else if (complete_reach) {
                        btn.dataset.complete = 'true'
                        setComplete(btn)
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

                    li.appendChild(btn)
                    li.appendChild(desc)
                    tree.appendChild(li)
                })
            }
        }
    })

    document.getElementById("side-challange")?.addEventListener('click', async() => {
        let val = await listTodaysChallange() as challangeData
        side_mainFunc("Today", 'side-challange', async() => {
            if (val) {
                let check: Boolean[] = await listCompletedTasks()
                let res = await eel.make3d(val, check)()
                list_items(res, true)
            }
        })
    })

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

    document.getElementById("side-new-task")?.addEventListener("click", async() => {
        const text = "Enter the name of the new task";
        let name = await showContext("Enter the name of the new task", 'text')
        let date: any = await showContext("Enter the date of the new task", 'date')
        let time: any = await showContext("Enter the time of the new task", 'time')
        const dateTime = new Date(`${date}T${time}`)
        if (await eel.validateDateTime(dateTime.toISOString())()) {
            date = date.split('-')
            time = time.split(':')
            eel.addTask(name, "My project", "Axter", `${date[0]}/${date[1]}/${date[2]}/${time[0]}/${time[1]}`)
        }
    });

    document.getElementById('new-routine')?.addEventListener('click', async() => {
        eel.log("NEW_SUDDEND_ROUTINE")()
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
    function setTheme(name: string, color: string) {
        document.documentElement.style.setProperty(`--${name}`, color)
    }
    let colorTheme = await eel.getColors()()
    Object.entries(colorTheme).forEach((arr: any) => {
        setTheme(arr[0], arr[1])
    });
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
                task_par.appendChild(more)
                setcheck(taskKey)
                more.onclick = async(e) => {
                    let ctx = document.getElementById("more-task-info")
                    if (ctx) {
                        ctx.style.top = `${String(e.clientY)}px`
                        ctx.style.left = `${String(e.clientX)}px`
                        ctx.style.display = "flex"
                        setTimeout(() => {
                        click_need= true
                        click_kind = ctx}, 20)
                    }
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
            subgroup_btn_par.onclick = () => {
                makeNewSubGroup(grp)
                makeSubGroupTree()
            }

            let content = document.createElement('div')
            content.classList = 'tab-content'

            let span = document.createElement('span')
            span.classList = 'material-symbols-outlined sub-icon'
            span.innerText = 'add'


            let span_desc = document.createElement('div')
            span_desc.classList = 'new-sub-grp'
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

                subgrp_desc.appendChild(subgrp_ico)
                subgrp_desc.appendChild(subgrp_name)

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


document.addEventListener('keydown', (e)=>{
    if (e.key == "Esc" && esc_need) {
        esc_kind.style.display = 'none'
        esc_need = false
    }
})

document.addEventListener('click', (e)=>{
    if (click_need) {
        click_kind.style.display = 'none'
        click_need = false
    }
})

function showContext(descriptions: string, type="text", val: any[] =[], disc_2=""): Promise<String> {
    return new Promise((resolve) => {
        const hide = document.getElementById('hide-all') as HTMLElement || null
        const desc = document.getElementById("context-description") as HTMLElement || null
        const input = document.getElementById("context-input") as HTMLInputElement || null
        if (hide && desc && input) {
            esc_need = true
            esc_kind = hide
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

            if (type == "text") {
                mode = "keydown"
                input.addEventListener(mode, key_handle);
            } else if (type == "time" || type == "date") {
                mode = "change"
                input.addEventListener(mode, handle);
            } else if (type == "dropdown") {
                let mode = "click"
                let drop = document.getElementById('dropdown') as HTMLElement || null
                let drop_tittle = document.getElementById('drop-title') as HTMLElement || null
                let drop_icon = document.getElementById('drop-arr') as HTMLElement || null
                let drop_ops = document.getElementById('drop-ops') as HTMLElement || null
                if (drop && drop_tittle && drop_icon && drop_ops) {
                    input.style.display = 'none'
                    drop.style.display = 'flex'
                    drop_tittle.innerText = disc_2
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
            } else {
                mode = "change"
                input.addEventListener(mode, handle);
            }
        }
    })
}
window.makeNewSubGroup = makeNewSubGroup;

