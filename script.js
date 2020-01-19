// too lazy to take all values from <inputs> //
INIT_FIELD_HEIGHT = 1000
INIT_FIELD_WIDTH = 1500
INIT_OBJ_OFFSET_X = 100
INIT_OBJ_OFFSET_Y = 100
// //

//   VARIABLES   //

let anim_interval_frame = 200
let angle_line_thicc = 2
let angle_line_x = 100
let bg_color = 'white'
let scale_line_x = 10
let tick_step = 0.03
let line_thic = 3
let scale = 1
let delay = 1
let g = 9.81
let precision = 3

let instant_animation = false
let draw_graph_as_line = true
let draw_angle_line = false // kinda broken
let draw_time_scale = true
let output_table = true
let auto_scale = true
let use_rad = false
//               //


class simulation_field
{
    constructor(height, width, start_x, start_y)
    {
        this.start_point = new Point(start_x, start_y)
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
        this.done = false
    }

    get_x(tick){
        console.log("scale in use", scale)
        return ((this.force * tick * Math.cos(this.angle)))
    }
        get_y(tick){ return (((this.force * Math.sin(this.angle)) - (9.81* tick)) * tick)}

    in_air()
    {
        console.log("current y:", this.cur_coords.y, "bord:", this.field.height)
        if (this.cur_coords.y < -this.field.start_point.y ) //this.field.height
        {
            console.log("done")
           this.done = true;
           return false;
        }
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

        let ctx = this.field.canvas
        let start_x = this.field.start_point.x
        let start_y = this.field.start_point.y
        let field_height = this.field.height
        ctx.strokeStyle = color
        ctx.lineWidth = line_thic;
        ctx.beginPath();

        console.log(
            "\nfrom\n",
            `(${field_height}-(${field_height} - ((${field_height} - ${pointprev.y})-${start_y})) * ${scale} ) =`,
            (field_height-(field_height - ((field_height - pointprev.y)-start_y)) * scale ),
            "\nto\n",
            `(${field_height}-(${field_height} - ((${field_height} - ${pointcur.y})-${start_y})) * ${scale} ) =`,
            (field_height-(field_height - ((field_height - pointcur.y)-start_y)) * scale )
        )
        if (draw_graph_as_line)
        {
            ctx.moveTo(start_x * scale + (pointprev.x * scale), (field_height - (field_height - ((field_height - pointprev.y) - start_y)) * scale));
            ctx.lineTo(start_x * scale + (pointcur.x * scale), (field_height - (field_height - ((field_height - pointcur.y) - start_y)) * scale));
            ctx.stroke();
        }

        if (draw_time_scale)
        {
            ctx.lineWidth = angle_line_thicc
            ctx.beginPath();
            ctx.moveTo(start_x*scale + (pointprev.x * scale), (field_height-(field_height - ((field_height - pointprev.y)-start_y)) * scale ));
            ctx.lineTo(start_x*scale + (pointcur.x *scale) + scale_line_x, (field_height-(field_height - ((field_height - pointcur.y ) - start_y)) * scale )- scale_line_x * Math.tan(this.angle));
            ctx.stroke();
        }

        if (draw_angle_line)
        {
            ctx.lineWidth = angle_line_thicc
            ctx.beginPath();
            ctx.moveTo( (start_x)*scale, field_height-start_y*scale );
            ctx.lineTo(start_x*scale + angle_line_x, field_height-((angle_line_x * Math.tan(angle))) );
            ctx.stroke();
        }
    }

    determine_color(distance)
    {
        let diff = this.max_distance - this.min_distance
        let from_left = Math.abs(distance - this.min_distance)
        let from_right = Math.abs(this.max_distance - distance)
        let blue = 255 * from_left / diff
        let red =  255 * from_right / diff

        let green = 100;
        return `rgb(${red},${green}, ${blue})`;
    }

    predict_livetime()
    {
        let y__ = this.field.start_point.y
        let speed = this.force
        let angle = this.angle
        // return (speed*Math.sin(angle) - this.field.height)/9.81
        // let time1 = (-speed*Math.sin(angle) + Math.sqrt(Math.pow(speed * Math.sin(angle), 2) + 4 * g * y__)) / (-2 * g )
        // let time2 = (-speed*Math.sin(angle) - Math.sqrt(Math.pow(speed * Math.sin(angle), 2) + 4 * g * y__)) / (-2 * g )
        let time1 = (speed*Math.sin(angle) + Math.sqrt(Math.pow(-speed * Math.sin(angle), 2) + 4 * g * y__)) / (2 * g )
        let time2 = (speed*Math.sin(angle) - Math.sqrt(Math.pow(-speed * Math.sin(angle), 2) + 4 * g * y__)) / (2 * g )
        return Math.max(time1, time2)
    }

    auto_scale()
    {
        let finish_tick = this.predict_livetime()
        scale = 1
        let graph_width =  this.field.start_point.x +this.get_x(finish_tick)
        console.log(`${this.field.start_point.x} +${this.get_x(finish_tick)}=`, this.field.start_point.x +this.get_x(finish_tick))
        let field_width = this.field.width

        scale = ( (field_width-this.field.start_point.x) / graph_width)
        console.log("field_width", field_width, "\ngraph_width", graph_width)

    }

    start()
    {
        let duration_elem = $("#duration");
        let vel_elem = $("#vel");
        let angle_elem = $("#ang");
        let height_elem = $("#height");
        let width_elem = $("#width");
        let dist_elem = $("#dist");

        duration_elem.text( round(this.predict_livetime(), precision) )
        vel_elem.text(this.force)
        angle_elem.text(round(this.angle, precision))
        height_elem.text(this.field.start_point.y)
        width_elem.text(this.field.start_point.x)
        dist_elem.text(round(this.get_x(this.predict_livetime()), precision))

        let instance = this
        let tick = 0
        let pointprev = null
        let pointcurr = new Point(0, 0)

        let tbody = $("#tbody")
        tbody.empty()

        let interval = setInterval(function ()
            {
                let x = instance.get_x(tick)
                let y = instance.get_y(tick)


                console.log("\ntick: ", tick, "\n\nx: ", x, " \nget_y: ", y)

                if (tick > 10000) clearInterval(interval)

                if (pointcurr)
                pointprev = pointcurr

                pointcurr = new Point(x, y)
                instance.cur_coords = pointcurr
                if (instance.max_distance < pointprev.distance(pointcurr))
                {
                    instance.max_distance = pointprev.distance(pointcurr)
                }
                if (instance.min_distance > pointprev.distance(pointcurr) && pointprev.distance(pointcurr)!= 0)
                {
                    instance.min_distance = pointprev.distance(pointcurr)
                }


                if (pointprev && pointcurr)
                {
                    instance.draw_self(pointprev, pointcurr)

                }
                if ( !instance.in_air() ) clearInterval(interval)
                if (output_table) tbody.append(`<tr><td>${ round(tick, precision) }</td><td>${round(instance.cur_coords.x, precision)}</td><td>${round(instance.cur_coords.y, precision)}</td></tr>`)

                tick += instant_animation ? 1 : tick_step

            },instant_animation ? 0 : delay)
    }
}

function create_instance(force_, angle_) {

    let field = new simulation_field(INIT_FIELD_HEIGHT, INIT_FIELD_WIDTH, INIT_OBJ_OFFSET_X, INIT_OBJ_OFFSET_Y)

    // converted degrees to rads already

    let obj = new physic_object(force_, angle_, field.start_point.x, field.start_point.y, field)
    if (auto_scale) obj.auto_scale()
    obj.start()
    return obj
}

function manager()
{
    // user inputs
    let force_elem_val = document.getElementById("force").value
    let angle_elem_val = document.getElementById("angle").value

    force = validate_force(force_elem_val)

    if (angle_elem_val.includes("-"))
    {
        angle_range = angle_elem_val.split("-")
        call_in_loop(angle_range)
    }

    else if (!use_rad)
        {
            angle = angle = rad_to_deg(angle_elem_val)
            obj_instance = create_instance(force, angle)
        }
    else
        {
            obj_instance = create_instance(force, angle)
        }
    }





function validate_force(force) {
    return Math.abs(parseInt(force) )

}

function rad_to_deg(rad) {
    return (Math.PI/180)*rad

}


function call_in_loop(angle_range) {

            let angle_step = angle_range.length == 3 ? angle_range[2] : 1
            let idx = parseInt(angle_range[0])
            let obj_instance = null

            let iii = setInterval(function ()
            {
                if (idx < parseInt(angle_range[1]) && obj_instance && obj_instance.done)
                {
                    idx += parseInt(angle_step)
                }

                else if (obj_instance){
                    // all objects done
                    clearInterval(iii)
                }

                if (!use_rad)
                {
                    angle = rad_to_deg(idx)
                    obj_instance = create_instance(force, angle)
                }
                else
                {
                    angle = idx
                    obj_instance = create_instance(force, angle)
                }

            }, instant_animation ? anim_interval_frame : 1000)
        }


function validate_int(s)
{
   if (!isNaN(parseInt(s)))return parseInt(s)
}
function validate_bool(s)
{
    return s == "true"
}


function round(float, decimal_places)
{
    return Math.round(float * (Math.pow(10,decimal_places)) )/Math.pow(10, decimal_places)
}






