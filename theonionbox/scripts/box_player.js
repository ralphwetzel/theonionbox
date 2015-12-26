// Dependencies:
//  jquery

function box_DataPlayer(play_callback, delay, timestamp_index) {
    this.delay = (delay ? delay : 0);
    this.timer_running = false;
    this.timer = null;
    this.frame_queue = []
    this.frame_queue_length = Math.round(delay / 1000) + 10;
    this.last_pointer = -1;  // signals the cell for the latest data that was appended
    this.first_pointer = -1; // signals the cell keeping the last data being sliced; if == last_pointer: empty
    this.play_callback = (play_callback ? play_callback : null);
    this.play_counter = 0;

    this.timestamp_index = (timestamp_index ? timestamp_index : 's');

    this.play_frame = null;
    this.play_data = null;

}

box_DataPlayer.prototype.start = function() {

    var peek_frame = function()
    {
        if (this.first_pointer == this.last_pointer) { return null; }

        var peek_pointer = this.first_pointer + 1;
        if (peek_pointer >= this.frame_queue_length) { peek_pointer = 0;}

        return this.frame_queue[peek_pointer]

    }.bind(this)

    var slice_frame = function()
    {
        if (this.first_pointer == this.last_pointer) { return null; }

        this.first_pointer += 1;
        if (this.first_pointer >= this.frame_queue_length) { this.first_pointer = 0; }

        return this.frame_queue[this.first_pointer];

    }.bind(this)

    var load_next_data = function() {

        this.play_data = null;
        do
        {
            if (!this.play_frame)
            {
                this.play_frame = slice_frame();
            }

            if (!this.play_frame) { break; }

            this.play_data = this.play_frame.pop();

            if (this.play_data === void 0)
            {
                this.play_frame = null;
                this.play_data = null;
            }

        } while (!this.play_data)

        if (!this.play_frame) { return false; }

        return true;

    }.bind(this)

    var play_next_data = function()
    {
        this.timer_running = false;
        if (!this.play_data) { return false };
        this.play_callback(this.play_data);
        wait_next_data();
        return true;

    }.bind(this)

    var wait_next_data = function () {

        if (this.timer_running == true) { return true; }

        if (load_next_data() == false) return;

        var next_timestamp = this.play_data[this.timestamp_index];

        var client_time = new Date().getTime();
        var timeout_value = next_timestamp + this.delay - client_time;

        if (timeout_value < 0)
        {
            play_next_data();
            return;
        }

        this.timer_running = true;
        this.timer = setTimeout(play_next_data, timeout_value);
        return;

    }.bind(this)

    wait_next_data();
}

box_DataPlayer.prototype.stop = function() {
    clearTimeout(this.timer);
    this.timer_running = false;
    this.timer = null;
    }


box_DataPlayer.prototype.append = function(frame){

    var test_pointer = this.last_pointer + 1;

    // check if overfloating => circle
    if (test_pointer >= this.frame_queue_length) { test_pointer = 0;}

    // no operation if we hit the first_pointer!
    if (test_pointer == this.first_pointer) { return false; }

    this.last_pointer = test_pointer;
    this.frame_queue[this.last_pointer] = frame;

    this.start();
    return true;
}
