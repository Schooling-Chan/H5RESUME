/* loading */
let loadingRender = (function() {
    let $loadingBox = $('.loadingBox'),
        $current = $loadingBox.find('.current');


    let imgData = ["img/icon.png", "img/zf_concatAddress.png", "img/zf_concatInfo.png", "img/zf_concatPhone.png", "img/zf_course.png", "img/zf_course1.png", "img/zf_course2.png", "img/zf_course3.png", "img/zf_course4.png", "img/zf_course5.png", "img/zf_course6.png", "img/zf_cube1.png", "img/zf_cube2.png", "img/zf_cube3.png", "img/zf_cube4.png", "img/zf_cube5.png", "img/zf_cube6.png", "img/zf_cubeBg.jpg", "img/zf_cubeTip.png", "img/zf_emploment.png", "img/zf_messageArrow1.png", "img/zf_messageArrow2.png", "img/zf_messageChat.png", "img/zf_messageKeyboard.png", "img/zf_messageLogo.png", "img/zf_messageStudent.png", "img/zf_outline.png", "img/zf_phoneBg.jpg", "img/zf_phoneDetail.png", "img/zf_phoneListen.png", "img/zf_phoneLogo.png", "img/zf_return.png", "img/zf_style1.jpg", "img/zf_style2.jpg", "img/zf_style3.jpg", "img/zf_styleTip1.png", "img/zf_styleTip2.png", "img/zf_teacher1.png", "img/zf_teacher2.png", "img/zf_teacher3.jpg", "img/zf_teacher4.png", "img/zf_teacher5.png", "img/zf_teacher6.png", "img/zf_teacherTip.png"];

    //预加载图片
    let n = 0,
        len = imgData.length;
    let run = function(callback) {

        imgData.forEach(item => {

            let tempImg = new Image;
            tempImg.onload = () => { //是个异步编程
                tempImg = null;
                $current.css('width', (++n / len * 100) + '%');

                //回调函数让当前loading消失
                if (n === len) clearTimeout(delayTime), callback && callback();
            }
            tempImg.src = item;
        });
    }

    //设置最长等待时间，到达10s查看加载多少，如果达到90%以上，可以正常访问，不足的话，直接提示用户当前网络不佳，稍后重试
    let delayTime = null;
    let maxDelay = function(callback) {

        delayTime = setTimeout(() => {
            clearTimeout(delayTime)

            if (n / len >= 0.9) {
                $current.css('width', '100%');
                callback && callback();
                return;
            }
            alert('当前网络不佳，稍后重试！');
            // window.location.href = 'http://www.baidu.com';
        }, 10000);
    }

    //完成
    let done = function() {
        let timer = setTimeout(() => {
            $loadingBox.remove(); //停留一秒进入下一个环节
            clearInterval(timer);

            phoneRender.init();
        }, 1500);
    }


    return {
        init: function() {
            $loadingBox.css('display', 'block');
            run(done);
            maxDelay(done);
        }
    }
})();

// loadingRender.init();

/* phoneBox */
let phoneRender = (function() {
    let $phoneBox = $('.phoneBox'),
        $time = $phoneBox.find('h2>span'),
        $answer = $phoneBox.find('.answer'),
        $answerMarkLink = $answer.find('.markLink'),
        $hang = $phoneBox.find('.hangUp'),
        $hangMarkLink = $hang.find('.markLink'),
        answerBell = $('#answerBell')[0],
        introduction = $('#introduction')[0];

    //回答按钮
    let answerMarkTouch = function() {
        $answer.remove();
        answerBell.pause(); //要先暂停再移出，否则还会响
        $(answerBell).remove();

        //show hangingPunctuation: 
        $hang.css({
            transform: 'translateY(0)',
        })
        $time.css({
            display: 'block',
        });
        introduction.play();
        computedTime(); //计算播放时间

    };

    let timr = null;
    let computedTime = function() {
        let duration = 0;
        introduction.addEventListener('canplay', () => {
            duration = introduction.duration;
        })
        timr = setInterval(() => {
            let time = introduction.currentTime;

            if (time >= duration) {
                clearInterval(timr);
                closePhone();
                return;
            }
            let mins = Math.floor(time / 60),
                sec = Math.floor(time % 60);

            mins = mins < 10 ? '0' + mins : mins;
            sec = sec < 10 ? '0' + sec : sec;
            $time.html(`${mins}:${sec}`);
        }, 1000);
    }

    //关闭页面
    let closePhone = function() {
        introduction.pause();
        $(introduction).remove();
        clearInterval(timr);

        $phoneBox.remove();
        messageRender.init();
    }


    return {
        init: function() {
            $phoneBox.css('display', 'block');
            //进入就播放
            answerBell.play();
            answerBell.volume = 0.3;

            $answerMarkLink.tap(answerMarkTouch);
            $hangMarkLink.tap(closePhone);
        }
    }
})();


/* messageBox */
let messageRender = (function() {
    let $messageBox = $('.messageBox'),
        $wrapper = $messageBox.find('.wrapper'),
        $messageList = $wrapper.find('li'),
        $keyboard = $messageBox.find('.keyboard'),
        $textInp = $keyboard.find('span'),
        $submit = $keyboard.find('.submit'),
        demonMusic = $('#demonMusic')[0];
    let step = -1, //当前信息索引
        total = $messageList.length + 1, //记录信息的总长度，自己发一条
        autoTime = null,
        interval = 1500; //信息出现间隔时间

    //展示信息
    let tt = 0;
    let showMessage = function() {
        ++step;
        if (step === 2) {
            //此时让键盘出来，执行手动发送
            handleSend();
            clearInterval(autoTime);
            return;
        }
        let $cur = $messageList.eq(step);
        $cur.addClass('active');

        if (step >= 3) {
            //让wrapper向上移动
            /* let curH = $cur[0].offsetHeight,
                wraT = parseFloat($wrapper.css('top'));
            $wrapper.css('top', wraT - curH); */
            //基于css获取transform得到的结果是矩阵
            let curH = $cur[0].offsetHeight;
            tt -= curH;
            $wrapper.css('transform ', `translateY(${tt}px)`);

        }
        if (step >= total - 1) {
            clearInterval(autoTime);
            closeMessage();
        }

    };

    let textTime = null;
    let handleSend = function() {
        $keyboard.css({
            transform: 'translateY(0)'
        }).one('transitionend', () => {
            //transitionend监听transition动画结束
            let str = '好的，马上介绍！',

                n = -1;
            textTime = setInterval(() => {
                let orginHTML = $textInp.html();
                $textInp.html(orginHTML + str[++n]);
                if (n >= str.length - 1) {
                    clearInterval(textTime); //文字显示完成
                    $submit.css('display', 'block');
                }
            }, 100);

        });
    };

    let handleSubmit = function() {
        $(`<li class="self">
        <i class="arrow"></i>
        <img src="img/zf_messageStudent.png" alt="" class="pic"> ${$textInp.html()}
    </li>`).insertAfter($messageList.eq(1)).addClass('active');
        //重新获取，把新的li放在页面中，我们应该此时重新获取Li，$messageList对应新的
        $messageList = $wrapper.find('li');



        $textInp.html('');
        $submit.css('display', 'none');
        $keyboard.css({
            transform: 'translateY(3.7rem)'
        });

        autoTime = setInterval(showMessage, interval);
    };


    let closeMessage = function() {

        let closeTime = setTimeout(() => {
            clearTimeout(closeTime);
            demonMusic.pause();
            $(demonMusic).remove();
            $messageBox.remove();

            cubeRender.init();
        }, interval);
    };


    return {
        init: function() {

            $messageBox.css('display', 'block');
            showMessage();
            autoTime = setInterval(showMessage, interval);

            $submit.tap(handleSubmit);

            demonMusic.play();
            demonMusic.volume = 0.3;
        }
    }
})();

/* cubeBox */
let cubeRender = (function() {
    let $cubeBox = $('.cubeBox'),
        $cube = $('.cube'),
        $cubeList = $cube.find('li');

    //手指旋转
    let start = function(e) {
        //记录起始坐标
        let point = e.changedTouches[0];
        this.strX = point.clientX;
        this.strY = point.clientY;
        this.changeX = 0;
        this.changeY = 0;
    };

    let move = function(e) {
        let point = e.changedTouches[0];
        this.changeX = point.clientX - this.strX;
        this.changeY = point.clientY - this.strY;
    };

    let end = function(e) {
        // 获取change/rotate值
        let { changeX, changeY, rotateX, rotateY } = this,
        isMove = false;
        //验证是否移动
        Math.abs(changeX) > 10 || Math.abs(changeY) > 10 ? isMove = true : null;

        // 只有发生移动才处理
        if (isMove) {
            //左右滑动 changeX => rotateY(正比)
            // 上下滑动 changeY => rotateX(反比)
            // 把移动距离的1/3作为旋转角度

            this.rotateX = rotateX = rotateX - changeY / 3;
            this.rotateY = rotateY = rotateY + changeX / 3;

            $(this).css('transform', `scale(0.6) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);

        }
        // 清空自定义属性
        ['strX', 'strY', 'changeX', 'changeY'].forEach(item => this[item] = null);
    };


    return {
        init: function() {
            $cubeBox.css('display', 'block');

            //手指操作cube，cube跟着旋转
            let cube = $cube[0];
            cube.rotateX = -35;
            cube.rotateY = 35; //记录初始的旋转角度
            $cube.on('touchstart', start).on('touchmove', move).on('touchend', end);

            // 点击页面跳转
            $cubeList.tap(function() {
                $cubeBox.css('display', 'none');
                // 通过传递参数点击li索引，将其定位到具体的slide
                let $index = $(this).index();
                detailRender.init($index);
            })

        }
    }
})();

/* detailBox */
let detailRender = (function() {
    let $detailBox = $('.detailBox'),
        swiper = null,
        $d1 = $('.page1>dl');

    let swiperInit = function() {
        swiper = new Swiper('.swiper-container', {
            effect: 'coverflow',
            //loop: true, //偶尔会出现无法切换
            onInit: move, //初始化成功执行的函数，参数是当前实例
            onTransitionEnd: move
        })
    };

    let move = function(sw) {
        let activeIn = sw.activeIndex,
            slideAry = sw.slides;
        if (activeIn === 0) {
            //折叠
            $d1.makisu({
                selector: 'dd',
                overlap: 0.6,
                speed: 0.8
            })
            $d1.makisu('open');
        } else {
            //折叠
            $d1.makisu({
                selector: 'dd',
                speed: 0
            })
            $d1.makisu('close');
        }

        // 滑动到某个页面，就把当前页面设置对应得ID，其余页面移出ID
        slideAry.forEach((item, index) => {
            if (activeIn === index) {
                item.id = `page${index+1}`;
                return;
            }
            item.id = null;
        })
    };


    return {
        init: function(index = 0) {
            $detailBox.css('display', 'block');
            if (!swiper) { //防止重复初始化
                swiperInit();
            }

            swiper.slideTo(index, 0); //第二个参数切换速度，0是立即切换

        }
    }
})();



// 开发中由于当前项目板块众多，每一个板块都是单例，通过标识的判断让程序只执行对应板块的内容，这样开发哪个板块执行那个板块（hash路由控制）

let url = window.location.href, //获取当前页面的url地址
    well = url.indexOf('#'),
    hash = well === -1 ? null : url.slice(well + 1);
switch (hash) {
    case 'loading':
        loadingRender.init();
        break;
    case 'phone':
        phoneRender.init();
        break;
    case 'message':
        messageRender.init();
        break;
    case 'cube':
        cubeRender.init();
        break;
    case 'detail':
        detailRender.init();
        break;
    default:
        loadingRender.init();
        break;
}