document.addEventListener("DOMContentLoaded", main);
let current = "Default";
let config = {
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
let chart = "";
const canvas = document.getElementById('routineChart');
if (canvas) {
    chart = new Chart(canvas, config);
}
const eel = window.eel;
console.log(eel);
function main() {
    window.requestAnimationFrame(() => {
        setTimeout(() => {
            makeChart();
            makeTestChart();
        }, 50);
    });
    document.getElementById("side-search")?.addEventListener("click", async () => {
        const input = document.getElementById("context-input");
        input.type = "text";
        console.log("showing context...");
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
                    let search_val = await eel.searchTask(value)();
                    console.log(search_val);
                    searchBoxShow(search_val, value);
                    input.removeEventListener("keydown", search_handler);
                }
            }
            search_handler = (e) => search(e, el, input);
            input.addEventListener("keydown", search_handler);
        }
    });
    document.getElementById('side-routine')?.addEventListener('click', async () => {
        let routine = document.getElementById('routine') || null;
        let current_el = document.getElementById(`${current}`) || null;
        let all_el = document.getElementById('all-routine') || null;
        console.log(all_el);
        if (routine && current_el && all_el) {
            current_el.style.display = "none";
            all_el.style.display = "flex";
            current = "all-routine";
            routine.style.display = "flex";
            let val = await eel.listAllRoutineNames()();
            let key = 0;
            val.forEach(async (task) => {
                key += 1;
                console.log(task);
                let routine = document.getElementById(`${task[0]}-routines`) || null;
                if (routine) {
                    let info = await eel.listRoutineTraits(task[0], task[1])();
                    console.log(info);
                    console.log(info.tasks);
                    let li = document.createElement('li');
                    li.classList = "routine-block";
                    li.dataset.path = `${task[0]}/${task[1]}`;
                    li.onclick = () => {
                        showroutinedetails(String(li.dataset.path));
                    };
                    let main_info = document.createElement('div');
                    main_info.classList = "routine-block-text";
                    let main_info_title = document.createElement('div');
                    main_info_title.classList = "routine-block-title";
                    main_info_title.innerText = task[1];
                    let main_info_descript = document.createElement('div');
                    main_info_descript.classList = "routine-block-summary";
                    let main_info_descript_hardest = document.createElement('div');
                    main_info_descript_hardest.innerText = `Hardest task: ${info['Most difficult'].name}`;
                    let main_info_descript_easiest = document.createElement('div');
                    main_info_descript_easiest.innerText = `Hardest task: ${info['Most easiest'].name}`;
                    let streak = document.createTextNode(`Day: ${info.Streak} Killing it!`);
                    let chart_par = document.createElement('div');
                    let graph = document.createElement('canvas');
                    graph.id = `graph${key}`;
                    chart_par.classList = 'routine-block-graph';
                    let labels = {
                        "daily": ['Sun', 'Tue', 'Thu', 'Sat'],
                        "weekly": ['W1', 'W2', 'W3', 'W4'],
                        "monthly": ['Jan', 'May', 'Sept', 'Dec']
                    };
                    let fix_dataPoints = [];
                    let label = [];
                    switch (task[0]) {
                        case "daily": {
                            label = labels['daily'];
                            fix_dataPoints = [info['consistancy'][0], info['consistancy'][2], info['consistancy'][4], info['consistancy'][6]];
                            break;
                        }
                        case "weekly": {
                            label = labels['weekly'];
                            fix_dataPoints = info['consistancy'];
                            break;
                        }
                        case "monthly": {
                            label = labels['monthly'];
                            fix_dataPoints = [info['consistancy'][0], info['consistancy'][4], info['consistancy'][8], info['consistancy'][11]];
                            break;
                        }
                    }
                    let config = {
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
                                    display: false,
                                }
                            }
                        }
                    };
                    let chart = "";
                    if (canvas) {
                        chart = new Chart(graph, config);
                    }
                    main_info_descript.appendChild(main_info_descript_hardest);
                    main_info_descript.appendChild(main_info_descript_easiest);
                    main_info_descript.appendChild(streak);
                    main_info.appendChild(main_info_title);
                    main_info.appendChild(main_info_descript);
                    chart_par.appendChild(graph);
                    li.appendChild(main_info);
                    li.appendChild(chart_par);
                    routine.appendChild(li);
                }
            });
        }
        async function showroutinedetails(path) {
            const current_element = document.getElementById(`${current}`);
            const el = document.getElementById("routine-stats") || null;
            const title = document.getElementById('routine-stat-title') || null;
            const diff = document.getElementById('most-difficult-task') || null;
            const easy = document.getElementById('most-easiest-task') || null;
            const streak = document.getElementById('streak') || null;
            const path_arr = path.split('/');
            const canvas = document.getElementById('routineChart');
            const data = await eel.listRoutineTraits(path_arr[0], path_arr[1])();
            if (el && title && diff && easy && streak && canvas && path_arr && current_element) {
                current_element.style.display = "none";
                current = "routine-stats";
                el.style.display = 'block';
                title.innerText = String(path_arr[1]);
                diff.innerText = data['Most difficult'].name;
                easy.innerText = data['Most easiest'].name;
                streak.innerText = data.Streak;
                let labels = {
                    "daily": ['Sun', 'Mon', 'Tue', 'Thu', 'Fri', 'Sat'],
                    "weekly": ['W1', 'W2', 'W3', 'W4'],
                    "monthly": ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
                };
                let label = [];
                switch (path_arr[0]) {
                    case "daily": {
                        label = labels['daily'];
                        break;
                    }
                    case "weekly": {
                        label = labels['weekly'];
                        break;
                    }
                    case "monthly": {
                        label = labels['monthly'];
                        break;
                    }
                }
                console.log(label);
                config.data.labels = label;
                config.data.datasets[0].data = data['consistancy'];
                chart.update();
                populate_routine_tasks(data['tasks'], data["Complete till"]);
            }
        }
        function populate_routine_tasks(tasks, complete) {
            console.log("HereXx");
            let complete_reach = true;
            let tree = document.getElementById('routine-task-tree') || null;
            if (tree) {
                tree.innerHTML = "";
                tasks.forEach((task) => {
                    let li = document.createElement('li');
                    li.classList = 'routine-step';
                    let btn = document.createElement('div');
                    btn.classList = 'routine-task-button';
                    let desc = document.createElement('div');
                    desc.classList = 'routine-discript';
                    desc.innerText = String(task);
                    if (task == complete) {
                        complete_reach = false;
                        setComplete(btn);
                    }
                    else if (complete_reach) {
                        setComplete(btn);
                    }
                    function setComplete(btn) {
                        let check = document.createElement('span');
                        check.classList = "material-symbols-outlined routine-complete-icon";
                        check.innerText = 'check';
                        btn.appendChild(check);
                    }
                    li.appendChild(btn);
                    li.appendChild(desc);
                    tree.appendChild(li);
                });
            }
        }
    });
    function searchBoxShow(searches, value) {
        let hideall = document.getElementById("hide-all-search") || null;
        if (hideall) {
            hideall.style.display = "flex";
            let title = document.getElementById('search-title') || null;
            title.innerText = `Searching for: ${value}`;
            let results_par = document.getElementById('search-ress') || null;
            Object.entries(searches).forEach(([k, v]) => {
                console.log("$$", k, v.name, v);
                let li = document.createElement('li');
                li.classList = 'search-res';
                let name = document.createElement('div');
                name.classList = "search-content";
                name.innerText = v.name;
                let map = document.createElement('div');
                map.classList = "search-map";
                map.innerText = v.map;
                li.appendChild(name);
                li.appendChild(map);
                results_par.appendChild(li);
            });
            let hideallhandle = (e) => {
                if (e.key == 'Escape') {
                    hideall.style.display = "none";
                    document.removeEventListener('keydown', hideallhandle);
                }
            };
            document.addEventListener('keydown', hideallhandle);
        }
    }
    document.getElementById("side-new-task")?.addEventListener("click", async () => {
        console.log("showing context...");
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
                    input.addEventListener("change", date_handler);
                    description.innerHTML = "Enter the date of the new task";
                }
            };
            let date_handler;
            date_handler = () => {
                const description = document.getElementById("context-description");
                if (nameEntered && description) {
                    date = input.value;
                    input.value = "";
                    input.type = "time";
                    input.removeEventListener("change", date_handler);
                    dateEntered = true;
                    input.addEventListener("change", time_handler);
                    description.innerHTML = "Enter the time of the new task";
                }
            };
            let time_handler;
            time_handler = async () => {
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
                            let clean_date = [
                                in_date.getFullYear(),
                                String(in_date.getMonth() + 1),
                                String(in_date.getDate()),
                                String(in_date.getHours()),
                                String(in_date.getMinutes())
                            ].join('/');
                            console.log(clean_date);
                            await eel.addTask(name, "My projects", "My projects", clean_date);
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
        }
    });
    document.getElementById("side-Today")?.addEventListener('click', async () => {
        const today = document.querySelector("#Today");
        const current_element = document.getElementById(`${current}`);
        console.log(current_element);
        if (today && current_element) {
            current = "Today";
            current_element.style.display = "none";
            today.style.display = "flex";
            let val = await eel.listTask("", "", "today")();
            console.log(typeof (val));
            console.log(val);
            list_items(val);
        }
    });
    document.getElementById("side-upcoming")?.addEventListener('click', async () => {
        const today = document.querySelector("#Today");
        const current_element = document.getElementById(`${current}`);
        console.log(current_element);
        if (today && current_element) {
            current = "Today";
            current_element.style.display = "none";
            today.style.display = "flex";
            let value = await eel.listTask("", "", "upcomming")();
            console.log(value);
            console.log(typeof (value));
            list_items(value);
        }
    });
    document.getElementById('side-group')?.addEventListener('click', async () => {
        const input = document.getElementById("context-input");
        input.type = "text";
        console.log("showing context...");
        let value = "";
        const text = "Enter the new group you want to make";
        const el = document.querySelector("#hide-all");
        const description = document.getElementById("context-description");
        if (el && description) {
            description.innerHTML = text;
            el.style.display = "block";
            let NewGroup_handler = "";
            async function NewGroup(e, el, input) {
                if (e.key == "Enter") {
                    el.style.display = "none";
                    let value = input.value;
                    input.value = "";
                    await eel.addNewGroup(value);
                    input.removeEventListener("keydown", NewGroup_handler);
                }
            }
            NewGroup_handler = (e) => NewGroup(e, el, input);
            input.addEventListener("keydown", NewGroup_handler);
        }
    });
    makeSubGroupTree();
}
async function list_items(tasks) {
    let lists = document.getElementById('tasks') || null;
    if (tasks && lists) {
        lists.innerHTML = '';
        let taskKey = 0;
        let margin = document.createElement('div');
        margin.style.height = '2vh';
        lists.appendChild(margin);
        tasks.forEach(task => {
            taskKey += 1;
            console.log("task: ", task);
            let task_par = document.createElement('li');
            task_par.classList = 'task';
            task_par.dataset.path = task[1];
            task_par.id = `task_par${taskKey}`;
            let task_btn = document.createElement('button');
            task_btn.classList = 'toggle-task';
            task_btn.id = `task-btn${taskKey}`;
            task_btn.onclick = () => {
                toggle(task_btn.id);
            };
            async function setcheck(key) {
                key = String(key);
                console.log(key);
                let icon = document.getElementById(`task_ico${key}`) || null;
                let task_par = document.getElementById(`task_par${key}`) || null;
                let task_desc = document.getElementById(`task_desc${key}`) || null;
                if (icon && task_par && task_desc) {
                    let path = task_par.dataset.path;
                    let donestatus = await eel.donestatus(`${path}/${task_desc.innerText}`)();
                    console.log("STATUS", donestatus);
                    if (!donestatus) {
                        icon.innerText = "";
                    }
                    else {
                        icon.innerText = "check_small";
                    }
                }
                else {
                    console.log("DDD", icon, task_par, task_desc);
                }
            }
            function toggle(id) {
                console.log(id.split('task-btn'));
                let key = id.split('task-btn')[1];
                let icon = document.getElementById(`task_ico${key}`) || null;
                let task_par = document.getElementById(`task_par${key}`) || null;
                if (icon && task_par) {
                    if (icon.innerText == "check_small") {
                        icon.innerText = "";
                        eel.toggletask(`${task_par.dataset.path}/${task_desc.innerText}`, false);
                    }
                    else {
                        icon.innerText = "check_small";
                        eel.toggletask(`${task_par.dataset.path}/${task_desc.innerText}`, true);
                    }
                }
            }
            let ico = document.createElement('span');
            ico.classList = 'material-symbols-outlined default-icon check-task';
            ico.id = `task_ico${taskKey}`;
            let task_desc = document.createElement('span');
            task_desc.classList = "task-description";
            task_desc.innerText = String(task[0]);
            task_desc.id = `task_desc${taskKey}`;
            task_btn.appendChild(ico);
            task_par.appendChild(task_btn);
            task_par.appendChild(task_desc);
            lists?.appendChild(task_par);
            setcheck(taskKey);
        });
        console.log("done with:-", lists);
    }
}
async function makeSubGroupTree() {
    let grps = await eel.listGroupDict()();
    let grps_htm = document.getElementById('groups') || null;
    if (grps_htm) {
        Object.entries(grps).forEach(([grp, subgrps]) => {
            let group_par = document.createElement('div');
            group_par.classList = 'group';
            let group_title = document.createElement('div');
            group_title.classList = 'group-title';
            group_title.innerText = grp;
            let subgroup_btn_par = document.createElement('div');
            subgroup_btn_par.classList = 'subgroup-wrap';
            subgroup_btn_par.onclick = () => {
                makeNewSubGroup(grp);
            };
            let content = document.createElement('div');
            content.classList = 'tab-content';
            let span = document.createElement('span');
            span.classList = 'material-symbols-outlined sub-icon';
            span.innerText = 'add';
            let span_desc = document.createElement('div');
            span_desc.classList = 'new-sub-grp';
            span_desc.innerText = 'New sub group';
            content.appendChild(span);
            content.appendChild(span_desc);
            subgroup_btn_par.appendChild(content);
            group_par.appendChild(group_title);
            group_par.appendChild(subgroup_btn_par);
            let subgrp_par = document.createElement('div');
            subgrp_par.classList = 'group-tabs';
            subgrps.forEach((subgrp, key) => {
                let subgrp_desc = document.createElement('div');
                subgrp_desc.classList = 'tab-description';
                subgrp_desc.id = `desc${key}`;
                subgrp_desc.dataset.grp = grp;
                subgrp_desc.dataset.subgrp = subgrp;
                subgrp_desc.onclick = async () => {
                    let val = await eel.listCatItems(subgrp_desc.dataset.grp, subgrp_desc.dataset.subgrp)();
                    let fmt_val = [];
                    console.log(val);
                    val.forEach((task) => {
                        console.log(`${grp}/${subgrp} ${task}`);
                        fmt_val.push([task, `${grp}/${subgrp}`]);
                    });
                    console.log(fmt_val);
                    list_items(fmt_val);
                };
                let subgrp_ico = document.createElement('span');
                subgrp_ico.classList = 'material-symbols-outlined';
                subgrp_ico.innerText = 'tag';
                let subgrp_name = document.createTextNode(subgrp);
                subgrp_desc.appendChild(subgrp_ico);
                subgrp_desc.appendChild(subgrp_name);
                subgrp_par.appendChild(subgrp_desc);
            });
            group_par.appendChild(subgrp_par);
            grps_htm.appendChild(group_par);
        });
    }
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
function makeNewSubGroup(catagory) {
    const input = document.getElementById("context-input");
    input.type = "text";
    console.log("showing context...");
    let value = "";
    const text = "Enter the name of the new subgroup";
    const el = document.querySelector("#hide-all");
    const description = document.getElementById("context-description");
    if (el && description) {
        el.style.display = "block";
        description.innerHTML = text;
        input.addEventListener("keydown", async (e) => {
            if (e.key == "Enter") {
                el.style.display = "none";
                let value = input.value;
                input.value = "";
                await eel.newSubGroup(catagory, value);
            }
        });
    }
}
function makeChart() {
    console.log('here');
}
function makeTestChart() {
    console.log('here');
    const canvas = document.getElementById('routine-block-graph');
    if (canvas) {
        console.log('here');
        const config = {
            type: "line",
            data: {
                labels: [
                    'Sun',
                    'Mon',
                    'Tue'
                ],
                datasets: [{
                        label: 'Progress (%)',
                        data: [10, 20, 30],
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
                        display: false
                    }
                }
            }
        };
        console.log('here');
        const _ = new Chart(canvas, config);
        console.log('here');
    }
}
window.makeNewSubGroup = makeNewSubGroup;
export {};
//# sourceMappingURL=script.js.map