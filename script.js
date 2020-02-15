// too lazy to take all values from <inputs> //
INIT_FIELD_HEIGHT = 1000
INIT_FIELD_WIDTH = 1000
INIT_OBJ_OFFSET_X = 0 // can be negative
INIT_OBJ_OFFSET_Y = 100 // can't be negative


//   VARIABLES   //

    var instant_tick_step = 0.5
    var anim_interval_frame = 200
    var angle_line_thicc = 2
    var angle_line_x = 100
    var bg_color = "rgb(254, 255, 234)" //'white'
    var scale_line_x = 10
    var tick_step = 1
    var line_thic = 3
    var scale = 1
    var delay = 200 // 1
    var g = 9.81
    var precision = 3
    var grass_quality = 1
    var pixels_per_mark = 100

    var instant_animation = false
    var draw_graph_as_line = true
    var draw_angle_line = false
    var draw_time_scale = false
    var output_table = true
    var auto_scale = false
    var use_rad = false
    var nuke = true
    var clear_field_after_round = false

//               //

let field

let nuke1000 = new Image();
nuke1000.src = "atomic.png"


draw_time_scale = instant_animation? false: draw_time_scale

document.addEventListener("input", function (e) {
    if (e.target.id == "force" || e.target.id == "angle" || e.target.id == "x-off" || e.target.id == "y-off") return
    console.log("event", e.target.id, e.target.value)

    if (e.target.value == "true" || e.target.value == "false")
    {
        console.log("bool")
        window[e.target.id] = validate_bool(e.target.value)
    }
    else if (parseFloat(String(parseFloat( e.target.value ))) ==  parseFloat( e.target.value )  )
    {
        console.log("int")
        window[e.target.id] = validate_int(e.target.value)
    }
    else
    {
        console.log("str")
        window[e.target.id] = e.target.value
    }



})



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
        //ctx.fillRect(0, 0, width, height)

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
        this.max_distance = 0//this.get_biggest_dist()
        this.min_distance = 100//this.get_smallest_dist()
        this.done = false
		this.keypoints = []
    }

    get_x(tick){

        return ((this.force * tick * Math.cos(this.angle)))
    }
        get_y(tick){ return (((this.force * Math.sin(this.angle)) - (9.81* tick)) * tick)}

    in_air()
    {
        if (this.cur_coords.y < -this.field.start_point.y )
        {
            //console.log(this,"\n\n\n\n\n\n\n\n DONE \n\n\n\n\n\n\n\n")
            this.done = true;

            if (clear_field_after_round)
            {
                field.canvas.fillStyle = bg_color
                field.canvas.fillRect(0,0, field.width, field.height)
                console.log("clear canvas")
            }

           return false;
        }
        else return true;
    }

    set set_y(y) {this.y = y}
    set set_force(force) {this.force = force}
    set set_angle(angle) {this.angle = angle}
    set set_tick(tick) {this.tick = tick}
    set set_coords(cur_coords) {this.cur_coords = cur_coords}
	
	draw_grass()
	{
	    return
		let ctx = this.field.canvas

        for (let c=0; c<grass_quality; c++)
        {
            for (let i=0; i<this.field.width; i++)
		    {
                let color = `rgba(${50 + Math.random()*50}, ${255-Math.random()*100}, ${50 + Math.random()*50}, ${1})`

                //console.log(color);
                ctx.strokeStyle = color
                ctx.moveTo(i, this.field.height);
                ctx.lineTo(i, this.field.height-Math.random()* 50);
                ctx.stroke();

		    }
        }

		
	}
	
	
    draw_self(pointprev, pointcur)
    {
        //console.log(this.keypoints)
        // so basically to draw frame we need to clear canvas
        // and draw instantly all existing key positions for
        // object instance. Also need to draw scale thing

        // initializing new positions
        if (pointprev!=null && pointcur!=null){
		    this.keypoints.push({"pointprev": pointprev, "pointcur": pointcur})
            //console.log("add keypoint")
            }

        let ctx = this.field.canvas
        let start_x = this.field.start_point.x
        let start_y = this.field.start_point.y
        let field_height = this.field.height
        ctx.lineWidth = line_thic;
        ctx.beginPath();
		//console.log(this.keypoints)

		for (let index = 0; index < this.keypoints.length; index++)
		{
			let pointp = pointprev//this.keypoints[index]["pointprev"]
			let pointc = pointcur//this.keypoints[index]["pointcur"]
            //console.log("drawing form", pointp, "to", pointc)


			if (draw_graph_as_line)
			{
			    ctx.strokeStyle = "blue"//this.determine_color(pointp, pointc)
				ctx.moveTo(start_x * scale + (pointp.x * scale), (field_height - (field_height - ((field_height - pointp.y) - start_y)) * scale));
				ctx.lineTo(start_x * scale + (pointc.x * scale), (field_height - (field_height - ((field_height - pointc.y) - start_y)) * scale));
				ctx.stroke();
			}

			if (draw_time_scale)
			{
				ctx.lineWidth = angle_line_thicc
				ctx.beginPath();
				ctx.moveTo(start_x*scale + (pointp.x * scale), (field_height-(field_height - ((field_height - pointp.y)-start_y)) * scale ));
				ctx.lineTo(start_x*scale + (pointc.x *scale) + scale_line_x, (field_height-(field_height - ((field_height - pointc.y ) - start_y)) * scale )- scale_line_x * Math.tan(this.angle));
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
    }
	nuke()
	{
		this.field.canvas.drawImage(nuke1000, 0, 0);
	}

	peacefull_life()
	{
			this.field.canvas.drawImage();
	}
	


    determine_color(distance)
    {
        let diff = ((this.max_distance) - (this.min_distance)) * 100
        //console.log("\nmax:", this.max_distance, "\nmin:",this.min_distance)
        let from_left = Math.abs(distance - this.min_distance) * 100
        let from_right = Math.abs(this.max_distance - distance) * 100
        let point = diff / 255
        //console.log("point (1/255) is", point, "diff is", diff, "red dist", from_right, "blue dist", from_left)
        let blue = point * from_left
        let red =  point * from_right
        //console.log("red:", red, "\nblue:", blue)
        let green = 100;
        return `rgb(${red},${green}, ${blue})`;
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


    get_biggest_dist()
{
    let t0p = new Point(this.get_x(0), this.get_y(0))
    let t1p = new Point(this.get_x(tick_step), this.get_y(tick_step))
    return t0p.distance(t1p)
}

get_smallest_dist() {
    let start_x = this.field.start_point.x
    let speed = this.force
    let angle = this.angle
    let half_period = start_x/speed*Math.cos(angle)
    let mid_time = half_period/2
    let sp1 = new Point(this.get_x(mid_time), this.get_y(mid_time))
    let sp2 = new Point(this.get_x(mid_time+tick_step), this.get_y(mid_time+tick_step))
    return sp1.distance(sp2)
}

    auto_scale()
    {
        let finish_tick = this.predict_livetime()
        scale = 1
		
		let graph_height = this.get_y( (  (this.force * Math.sin(angle))/g )/2 ) + this.field.start_point.y
		let field_height = this.field.height
		
        let graph_width =  this.field.start_point.x +this.get_x(finish_tick)
        let field_width = this.field.width
		
		//console.log("graph height:\n", graph_height, "\ngraph width:\n", graph_width, "\nfield height:\n", field_height, "\ngraph width\n", field_width)
		
		
		// fitting all graph into field
        //scale = graph_width>graph_height ? ( (field_width-this.field.start_point.x) / graph_width) : ( (field.height-this.field.start_point.y) / graph_height)
		let scale1 = (field_width-this.field.start_point.x) / graph_width 
		let scale2 = (field_height-this.field.start_point.y) / graph_height
		scale = Math.min(scale1,scale2 ) 
    }

    start()
    {
		this.draw_grass()
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
        console.log("lt", round(this.get_x(this.predict_livetime()), precision))

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


                //console.log("\ntick: ", tick, "\n\nx: ", x, " \nget_y: ", y)

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

                tick += instant_animation ? instant_tick_step : tick_step

            },100) //instant_animation ? 0 : delay
    }
}




function create_instance(force_, angle_) {
    // converted degrees to rads already
    let obj = new physic_object(force_, angle_, field.start_point.x, field.start_point.y, field)
    return obj
}

function manager()
{
    // user inputs
    document.getElementById("start").disabled = true;
    let force_elem_val = document.getElementById("force").value
    let angle_elem_val = document.getElementById("angle").value
    let xOffElemVal = document.getElementById("x-off").value
    let yOffElemVal = document.getElementById("y-off").value
    let obj_instance

    if (xOffElemVal)
        INIT_OBJ_OFFSET_X = validate_int(xOffElemVal)

    if (yOffElemVal)
        INIT_OBJ_OFFSET_Y = validate_int(yOffElemVal)

    field = new simulation_field(INIT_FIELD_HEIGHT, INIT_FIELD_WIDTH, INIT_OBJ_OFFSET_X, INIT_OBJ_OFFSET_Y)

    force = validate_force(force_elem_val)

    if (angle_elem_val.includes("-"))
    {
        angle_range = angle_elem_val.split("-")
        call_in_loop(angle_range)
    }

    // single object launch
    else
    {
        if (!use_rad)
        {
            angle = angle = rad_to_deg(angle_elem_val)
            obj_instance = create_instance(force, angle)
        }

        else
        {
            obj_instance = create_instance(force, angle)
        }

        if (auto_scale)
        {
            obj_instance.auto_scale()

        }
        scale_axis(scale)


        obj_instance.start()
        document.getElementById("start").disabled = false;
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
            let obj_instances = []
            let obj_instance = null
            let angle

            let iii = setInterval(function ()
            {
                //console.log(obj_instance)
                if (idx < parseInt(angle_range[1]) && ( (obj_instance && obj_instance.done)  ||  (!obj_instance) )  )
                {
                    idx += parseInt(angle_step)

                    if (!use_rad)
                        angle = rad_to_deg(idx)
                    else
                        angle = idx


                    //if (!clear_field_after_round)
                        //obj_instances.forEach(function (item) { item.draw_self(null, null) } )

                    obj_instance = create_instance(force, angle)
                    //obj_instances.push(obj_instance)
                }


                else if (obj_instance.done){
                    console.log("all done")
                    clearInterval(iii)
                    document.getElementById("start").disabled = false;

                    // clear field
                    obj_instance.field.canvas.fillRect(0, 0, obj_instance.field.width, obj_instance.field.height)

                    if (nuke)
                    {
			            obj_instance.nuke()
		            }

                }
                else console.log("not done yet. skipping...\n")

                if (auto_scale)
                {
                    obj_instance.auto_scale()

                }
                scale_axis(scale)

                obj_instance.start()



            }, 100)
}

function scale_axis(scale)
{
    console.log("scale:",scale)
    let horizDiv = document.getElementById("horizontal")
    let vertDiv = document.getElementById("vertical")

    while (horizDiv.firstChild) {
    horizDiv.removeChild(horizDiv.firstChild);
    }
    while (vertDiv.firstChild) {
    vertDiv.removeChild(vertDiv.firstChild);
    }

    for (let xIdx=0; xIdx <= field.width/pixels_per_mark; xIdx++)
    {
        let point = document.createElement("div");
        point.innerText = round( (xIdx * pixels_per_mark) / scale, precision )
        point.setAttribute("class", "pointX")
        point.style.width = `${pixels_per_mark}px`
        horizDiv.appendChild(point)
    }

    for (let yIdx=0; yIdx <= field.height/pixels_per_mark-1; yIdx++)
    {
        let point = document.createElement("div");
        point.setAttribute("class", "pointY")
        point.innerText = round ((field.height - yIdx * pixels_per_mark) / scale, precision)
        point.style.height = `${pixels_per_mark}px`
        vertDiv.appendChild(point)
    }

}

function validate_int(s)
{
   if (!isNaN(parseInt(s)))return parseFloat(s)
}

function validate_bool(s)
{
    return s == "true"
}

function round(float, decimal_places)
{
    return Math.round(float * (Math.pow(10,decimal_places)) )/Math.pow(10, decimal_places)
}










