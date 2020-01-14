// SYSTEM VARIABLES //
let use_rad = false
let tick_step = 0.1
let line_thic = 3
let scale = 0.5
let delay = 5
let bg_color = 'white'
//                  //


class simulation_field
{
    constructor(height, width, start_x, start_y)
    {
        this.start_point = new Point(start_x, height-start_y)
        let canvas;
        this.width = width
        this.height = height
        canvas = document.getElementById("canvas")
        let ctx = canvas.getContext("2d")
        ctx.canvas.height = height
        ctx.canvas.width = width
        ctx.fillStyle = bg_color
        ctx.fillRect(0, 0, width, height)

        this.canvas = ctx
    }
}

class Point
{
    constructor(x, y)
    {
        this.x = x;
        this.y = y;
    }
    distance(point)
    {
        return Math.sqrt(Math.pow(Math.abs(point.x - this.x), 2) + Math.pow(Math.abs(point.y - this.y), 2))
    }
}

class physic_object
{
    constructor(start_force, start_angle, start_x, start_y, _field)
    {
        this.force = start_force;
        this.angle = start_angle;
        this.tick = 0;
        this.field = _field;
        this.cur_coords = new Point(start_x, start_y);
        this.max_distance = 0
        this.min_distance = 100
    }

    in_air()
    {
        console.log("current y:", this.cur_coords.y, "bord:", this.field.height)
        if (this.cur_coords.y > this.field.height)
             return false;
        else return true;
    }

    set set_y(y) {this.y = y}
    set set_force(force) {this.force = force}
    set set_angle(angle) {this.angle = angle}
    set set_tick(tick) {this.tick = tick}
    set set_coords(cur_coords) {this.cur_coords = cur_coords}

    draw_self(pointprev, pointcur)
    {
        let color = this.determine_color(pointprev.distance(pointcur))

        console.log("max dist:", this.max_distance);
        console.log("min dist:", this.min_distance);
        let ctx = field.canvas
        ctx.strokeStyle = color
        ctx.lineWidth = line_thic;
        ctx.beginPath();
        ctx.moveTo(pointprev.x, pointprev.y);
        ctx.lineTo(pointcur.x, pointcur.y);
        ctx.stroke();
    }

    determine_color(distance)
    {
        let diff = this.max_distance - this.min_distance
        let from_left = Math.abs(distance - this.min_distance)
        let from_right = Math.abs(this.max_distance - distance)
        let blue = 255 * from_left / diff
        let red =  255 * from_right / diff

        console.log("red:", red)
        console.log("blue:", blue)

        let green = 100;
        return `rgb(${red},${green}, ${blue})`;
    }

    predict_livetime()
    {
        let speed = this.force
        let angle = this.angle
        return speed*Math.sin(angle)/9.81
    }

    start()
    {
        let duration_elem = $("#duration")
        let vel_elem = $("#vel")
        let angle_elem = $("#ang")

        duration_elem.text(this.predict_livetime())
        vel_elem.text(this.force)
        angle_elem.text(this.angle)

        let instance = this
        let tick = 0
        let pointprev = field.start_point
        let pointcurr = null
        let tbody = $("#tbody")
        tbody.empty()
        let interval = setInterval(function ()
            {
                let x = instance.field.start_point.x + ((instance.force * tick * Math.cos(instance.angle))) * scale
                let y = instance.field.start_point.y - (((instance.force * Math.sin(instance.angle)) - (9.81* tick)) * tick) * scale
                console.log("\ntick: ", tick, "\n\nx: ", x, " \ny: ", y)

                if (tick > 100000) clearInterval(interval)
                if (pointcurr)
                pointprev = pointcurr

                pointcurr = new Point(x, y)
                instance.cur_coords = pointcurr
                console.log("distance betw 2 points:", pointprev.distance(pointcurr))
                if (instance.max_distance < pointprev.distance(pointcurr))
                {
                    instance.max_distance = pointprev.distance(pointcurr)
                }
                if (instance.min_distance > pointprev.distance(pointcurr) && pointprev.distance(pointcurr)!= 0)
                {
                    console.log("change min dist:", pointprev, pointcurr)
                    instance.min_distance = pointprev.distance(pointcurr)
                }


                if (pointprev && pointcurr)
                {
                    instance.draw_self(pointprev, pointcurr)

                }
                if ( !instance.in_air() ) clearInterval(interval)

                tbody.append(`<tr><td>${Math.round(tick )}</td><td>${instance.cur_coords.x}</td><td>${instance.cur_coords.x}</td></tr>`)
                tick += tick_step

            },delay)
    }
}

function start() {
    field = new simulation_field(700, 700, 0, 500)
    force = parseInt(document.getElementById("force").value)
    angle = parseInt(document.getElementById("angle").value)
    if (!use_rad)
        // converting to degrees
        angle = angle * (Math.PI/180)

    obj = new physic_object(force, angle, field.start_point.x, field.start_point.y, field)
    obj.start()
}







