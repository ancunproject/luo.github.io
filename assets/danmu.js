import $ from 'jquery';
let DanMu = (function () {
  // const MAX_AMOUNT = 999999999999999999999999999999999999;
  const MIN_RUNNERS = 999999999999999999999999999999999999;
  let d = {
    square: '',
    square_high: 0,
    roads: 0,
    addRunners: 0
  };
  let r = {
    init_all_road: [],
    all_road: [],
    map_road: {},
    runner_idx: []
  };
  let glo = {
    screen_runners_max: 0,
    play_count: 0,
    runners_play_count: 0
  };
  let help = {
    road_finish: {},
    road_finish_runner: {}
  };
  // eslint-disable-next-line camelcase
  let fail_queue = [];
  // eslint-disable-next-line camelcase
  let global_time_out = {};
  let _init = function (initD) {
    d = {
      square: '',
      square_high: 0,
      roads: 0,
      addRunners: 0
    };
    r = {
      init_all_road: [],
      all_road: [],
      map_road: {},
      runner_idx: []
    };
    glo = {
      screen_runners_max: 0,
      play_count: 0,
      runners_play_count: 0
    };
    help = {
      road_finish: {},
      road_finish_runner: {}
    };
    // eslint-disable-next-line camelcase
    fail_queue = [];
    // eslint-disable-next-line camelcase
    global_time_out = {};
    d = Object.assign({}, d, initD);
    d.square_high = parseFloat(getComputedStyle(d.square).height);
    d.roads = (d.square_high / d.road_high) >> 0;
    glo.screen_runners_max = d.roads * d.road_per_runner;
    for (let i = 0; i < d.roads; i++) {
      r.all_road[i] = {
        name: i,
        runner: {},
        amount: 0
      };
      r.init_all_road[i] = i;
    }
    if (d.show_lines) {
      let _lines = '';
      for (let k = 0; k < d.roads; k++) {
        _lines += '<div style="height: ' + d.road_high + 'px;line-height:' + d.road_high + 'px;border-bottom: 1px solid #000;box-sizing: border-box;"></div>';
      }
      document.getElementsByClassName('lines')[0].innerHTML = _lines;
    }
    (d.stopElementId) && stop_runner_event(d.stopElementId);
    d.addRunners = d.runners;
    if (d.runners.length < MIN_RUNNERS) {
      d.addRunners = shuffle(d.runners.concat(d.runners, d.runners));
    }
    d.addRunners.forEach(function (unit, i) {
      r.map_road[i] = unit;
      r.runner_idx.push(i);
    });
    put_runner_to_road(-1, {});
    console.log(d, r);
  }
  let getRandomInt = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
  }
  let ranDomColor = function (color) {
    if (color && (color.constructor == Array)) {
      let index = Math.floor(Math.random() * (color.length))
      return color[index];
    } else if (color && (color.constructor == String)) {
      return color
    } else {
      return '#' + Math.floor(Math.random() * 0xffffff).toString(16);
    }
  };

  let ranDomSize = function (size) {
    if (size && (size.constructor == Array)) {
      let index = Math.floor(Math.random() * (size.length))
      return size[index] + 'px';
    } else if (size && (size.constructor == String)) {
      return size + 'px'
    } else {
      return getRandomInt(12, 16) + 'px'
    }
  };
  let shuffle = function (arr) {
    let _arr = arr.slice();
    for (let i = 0; i < _arr.length; i++) {
      let j = getRandomInt(0, i);
      let t = _arr[i];
      _arr[i] = _arr[j];
      _arr[j] = t;
    }
    return _arr;
  }
  // eslint-disable-next-line camelcase
  let put_runner_to_road = function (roadName, aheadOption) {
    if (roadName == -1) {
      if (r.init_all_road.length) {
        match_road_to_runner(r.init_all_road[0]);
        r.init_all_road.splice(0, 1);
        put_runner_to_road(-1, {});
      }
    } else {
      match_road_to_runner(roadName, aheadOption);
    }
  }
  // eslint-disable-next-line camelcase
  let match_road_to_runner = function (roadName, aheadOption) {
    // eslint-disable-next-line camelcase
    let road_data_idx = '';
    let roadDatas = r.all_road.filter(function (obj, i) {
      if (obj.name == roadName) {
        // eslint-disable-next-line camelcase
        road_data_idx = i;
        return obj;
      }
    });
    if (roadDatas && roadDatas.length) {
      // eslint-disable-next-line camelcase
      let road_data = roadDatas[0];
      // eslint-disable-next-line camelcase
      if (road_data && (road_data.amount >= 0)) {
        let runner = get_runner();
        if (runner) {
          road_data.amount++;
          road_data.runner[runner.mapNumber] = runner.mapObj;
          if (road_data.amount >= d.road_per_runner) {
            help.road_finish[roadName] = road_data.amount;
            // eslint-disable-next-line no-undef
            help.road_finish_runner[roadName] = $.extend(true, {}, road_data.runner);
            r.all_road.splice(road_data_idx, 1);
          }
          go_run(roadName, runner.mapObj, aheadOption);
        } else {
          fail_queue.push({
            roadName: roadName,
            // eslint-disable-next-line no-undef
            aheadOption: $.extend({}, aheadOption)
          });
        }
      }
    } else {
      fail_queue.push({
        roadName: roadName,
        // eslint-disable-next-line no-undef
        aheadOption: $.extend({}, aheadOption)
      });
    }
  }
  // eslint-disable-next-line camelcase
  let get_runner = function () {
    // eslint-disable-next-line camelcase
    let runner_idx = r.runner_idx;
    // eslint-disable-next-line camelcase
    let runner_idx_length = runner_idx.length;
    // eslint-disable-next-line camelcase
    if (runner_idx_length > 0) {
      glo.runners_play_count++;
      glo.play_count = glo.runners_play_count / (glo.screen_runners_max + 1) >> 0;
      // eslint-disable-next-line camelcase
      let map_code = Math.random() * (runner_idx_length) >> 0;
      // eslint-disable-next-line camelcase
      let map_number = runner_idx[map_code];
      // eslint-disable-next-line camelcase
      let map_content = r.map_road[map_number];
      let runner = init_runner(map_number, map_content, d.square.querySelector('.unit[has_finish="true"]'));
      r.runner_idx.splice(map_code, 1);
      return runner;
    } else {
      return null;
    }
  }
  // eslint-disable-next-line camelcase
  let init_runner = function (mapNumber, mapContent, $replace) {
    let _$div;
    if (!$replace) {
      _$div = document.createElement('div');
      _$div.addEventListener('webkitAnimationEnd', function (ev) {
        run_finish(ev);
      });
      _$div.addEventListener('click', function (ev) {
        run_click(ev, d.click_call);
      });
      d.square.appendChild(_$div);
    } else {
      _$div = $replace;
    }
    _$div.setAttribute('class', 'unit');
    _$div.setAttribute('has_finish', 'false');
    _$div.setAttribute('map_number', mapNumber);
    _$div.setAttribute('length', mapContent.split('').length);
    _$div.innerHTML = mapContent;
    if (_$div.nodeType == 1) {
      _$div.setAttribute('width', parseFloat(window.getComputedStyle(_$div).width));
      _$div.setAttribute('height', parseFloat(window.getComputedStyle(_$div).height));
    }
    return {
      mapNumber: mapNumber,
      mapObj: _$div
    };
  }
  // eslint-disable-next-line camelcase
  let go_run = function (roadName, $runner, aheadOption) {
    let delay = 0;
    // if (d.road_per_runner < MAX_AMOUNT) {
    delay = (1 / Math.sqrt(d.road_per_runner)) * (0.5 + ((glo.play_count > 2) ? 1 : Math.min(Math.random(), 0.5)) * (Math.abs(Math.sin(roadName)) * 2 + Math.random() * 6));
    // }
    // eslint-disable-next-line camelcase
    let text_length = $runner.getAttribute('length');
    // eslint-disable-next-line camelcase
    let duration = Math.floor(8 + Math.abs(Math.cos(roadName)) * Math.max(text_length, 4) + Math.random() * Math.max(text_length * 1.5, 10));
    if (d.duration) {
      duration = d.duration;
    }
    if (d.road_padding) {
      $runner.style.top = d.road_padding + (roadName % d.roads) * d.road_high + 'px';
    } else {
      $runner.style.top = (8 + (roadName % d.roads) * d.road_high + (Math.sin(Math.random() * 50)) * 10) + 'px';
    }

    $runner.style.color = ranDomColor(d.color)
    $runner.style.fontSize = ranDomSize(d.fontsize)
    let width = parseFloat(window.getComputedStyle(d.square).width);
    let distance = parseFloat($runner.getAttribute('width'));
    try {
      if (aheadOption.leafTime) {
        let realLeafTime = aheadOption.leafTime - parseFloat(delay);
        if (realLeafTime > 0) {
          let maxSpeed = width / realLeafTime;
          let maxDuration = (distance + width) / maxSpeed;
          duration = Math.max(parseFloat(duration), maxDuration);
        }
      }
    } catch (e) {
      aheadOption = {
        leafTime: 0
      };
    }
    $runner.style.animationDelay = delay + 's';
    $runner.style.webkitAnimationDelay = delay + 's';
    $runner.style.animationDuration = duration + 's';
    $runner.style.webkitAnimationDuration = duration + 's';
    let _className = 'unit danmu_unit ';
    if (glo.play_count == 0) {
      _className += 'danmu_unit_half';
    } else {
      _className += 'danmu_unit_all';
    }
    $runner.setAttribute('class', _className);
    $runner.setAttribute('road_name', roadName);
    delay = parseFloat(delay);
    duration = parseFloat(duration);
    let speed = ((distance + width) / duration);
    // eslint-disable-next-line camelcase
    let shown_time = ((distance) / speed);
    // eslint-disable-next-line camelcase
    let next_delay = 0;
    // if (d.road_per_runner < MAX_AMOUNT) {
    // eslint-disable-next-line camelcase
    next_delay = ((delay + shown_time + (duration - shown_time) / d.road_per_runner) * 1000);
    // eslint-disable-next-line camelcase
    aheadOption.leafTime = (duration - shown_time - (duration - shown_time) / d.road_per_runner);
    // } else {
    //   // eslint-disable-next-line camelcase
    //   next_delay = ((delay + shown_time) * 1000);
    //   // eslint-disable-next-line camelcase
    //   aheadOption.leafTime = (duration - shown_time);
    // }
    // eslint-disable-next-line camelcase
    (function ($runner, roadName, next_delay, aheadOption) {
      if (!window.paused) {
        let fun = function () {
          put_runner_to_road(roadName, aheadOption);
        }
        let _timeout = setTimeout(function () {
          delete global_time_out[_timeout];
          fun();
        }, next_delay);
        global_time_out[_timeout] = {
          currentTime: +new Date(),
          delay: next_delay,
          fun: fun
        }
      }
    })($runner, roadName, next_delay, Object.assign({}, aheadOption));
  }
  // eslint-disable-next-line camelcase
  let run_finish = function (ev) {
    let _$target = ev.target;
    // eslint-disable-next-line camelcase
    let map_number = _$target.getAttribute('map_number');
    // eslint-disable-next-line camelcase
    let road_name = _$target.getAttribute('road_name');
    _$target.setAttribute('has_finish', 'true');
    // eslint-disable-next-line camelcase
    let temp_road = r.all_road.filter(function (obj, i) {
      // eslint-disable-next-line camelcase
      if (obj.name == road_name) {
        return obj;
      }
    });
    if (temp_road.length) {
      temp_road[0].amount--;
      delete temp_road[0].runner[map_number];
    } else {
      r.all_road.push({
        name: road_name,
        runner: help.road_finish_runner[road_name],
        amount: (help.road_finish[road_name] - 1)
      });
      delete help.road_finish_runner[road_name];
    }
    _$target.className = 'unit';
    _$target.style.transform = 'translate(0px, 0px)';
    _$target.style.webkitTransform = 'translate(0px, 0px)';
    r.runner_idx.push(map_number);
    // eslint-disable-next-line camelcase
    let fail_unit = fail_queue.shift();
    // eslint-disable-next-line camelcase
    if (fail_unit) {
      put_runner_to_road(fail_unit.roadName, fail_unit.aheadOption);
    }
  }
  // eslint-disable-next-line camelcase
  let run_click = function (ev, call) {
    call(ev.target);
  }
  // eslint-disable-next-line camelcase
  let stop_runner_event = function (idName) {
    document.getElementById(idName).addEventListener('click', function () {
      if (!window.paused) {
        this.innerText = '开始';
        window.paused = true;
        window.pausedTime = +new Date();
        window.paused_delay_funcs = [];
        r.all_road.forEach(function (data, i) {
          for (let key in data.runner) {
            // eslint-disable-next-line camelcase
            let $current_runner = data.runner[key];
            $current_runner.style.animationPlayState = 'paused';
            $current_runner.style.webkitAnimationPlayState = 'paused';
          }
        });
        for (let k1 in help.road_finish_runner) {
          for (let k2 in help.road_finish_runner[k1]) {
            // eslint-disable-next-line camelcase
            let $current_runner = help.road_finish_runner[k1][k2];
            $current_runner.style.animationPlayState = 'paused';
            $current_runner.style.webkitAnimationPlayState = 'paused';
          }
        }
        // eslint-disable-next-line camelcase
        for (let key in global_time_out) {
          clearTimeout(key);
          let currentTime = +new Date();
          global_time_out[key].delay = Math.max(0, global_time_out[key].delay - (window.pausedTime - global_time_out[key].currentTime));
          global_time_out[key].currentTime = currentTime;
        }
      } else {
        this.innerText = '暂停';
        window.paused = false;
        r.all_road.forEach(function (data, i) {
          for (let key in data.runner) {
            // eslint-disable-next-line camelcase
            let $current_runner = data.runner[key];
            $current_runner.style.animationPlayState = 'running';
            $current_runner.style.webkitAnimationPlayState = 'running';
          }
        });
        for (let k1 in help.road_finish_runner) {
          for (let k2 in help.road_finish_runner[k1]) {
            // eslint-disable-next-line camelcase
            let $current_runner = help.road_finish_runner[k1][k2];
            $current_runner.style.animationPlayState = 'running';
            $current_runner.style.webkitAnimationPlayState = 'running';
          }
        }

        // eslint-disable-next-line camelcase
        let old_global_time_out =
          // eslint-disable-next-line no-undef
          $.extend(true, {}, global_time_out);
        // eslint-disable-next-line camelcase
        global_time_out = {};
        // eslint-disable-next-line camelcase
        for (let key in old_global_time_out) {
          let currentTime = +new Date();
          (function (fun, delay, currentTime) {
            let _timeout = setTimeout(function () {
              delete global_time_out[_timeout];
              fun();
            }, delay);
            global_time_out[_timeout] = {
              fun: fun,
              delay: delay,
              currentTime: currentTime
            }
          })(old_global_time_out[key].fun, old_global_time_out[key].delay, currentTime);
        }
        // eslint-disable-next-line camelcase
        old_global_time_out = null;
      }
    });
  }
  return {
    init: _init
  }
}())

export default DanMu;