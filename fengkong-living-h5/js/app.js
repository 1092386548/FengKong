// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js

angular.module('starter', ['ionic', 'starter.controllers', 'starter.services'])

    .run(function ($ionicPlatform) {
        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);

            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }
        });
    })
    .config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
        $ionicConfigProvider.platform.ios.tabs.style('standard');
        $ionicConfigProvider.platform.ios.tabs.position('bottom');
        $ionicConfigProvider.platform.android.tabs.style('standard');
        $ionicConfigProvider.platform.android.tabs.position('bottom');
        $ionicConfigProvider.platform.ios.navBar.alignTitle('center');
        $ionicConfigProvider.platform.android.navBar.alignTitle('center');
        $ionicConfigProvider.platform.ios.backButton.previousTitleText('').icon('ion-ios-arrow-thin-left');
        $ionicConfigProvider.platform.android.backButton.previousTitleText('').icon('ion-android-arrow-back');
        $ionicConfigProvider.platform.ios.views.transition('ios');
        $ionicConfigProvider.platform.android.views.transition('android');

        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js
        $stateProvider
            // setup an abstract state for the tabs directive
            .state('tabs', {
                url: '/tab',
                abstract: true,
                templateUrl: 'templates/tabs.html',
                controller: 'TabCtrl'
            })

            // 登录
            .state('login', {
                url: "/login",
                cache: 'false',
                templateUrl: "templates/user/login.html",
                controller: "LoginCtrl"
            })
            // 注册
            .state('register', {
                url: "/register",
                cache: 'false',
                templateUrl: "templates/user/register.html",
                controller: "RegisterCtrl"
            })
            // 首页
            .state('tabs.home', {
                url: "/home",
                cache: 'false',
                views: {
                    'tab-home': {
                        templateUrl: "templates/home.html",
                        controller: "HomeCtrl"
                    }
                }
            })
            // 课程
            .state('tabs.progress', {
                url: "/progress/{homeBtn}",
                cache: 'true',
                views: {
                    'tab-progress': {
                        templateUrl: "templates/progress.html",
                        controller: "ProgressCtrl"
                    }
                }
            })
            // 活动
            .state('tabs.active', {
                url: "/active/{tab}",
                cache: 'false',
                views: {
                    'tab-active': {
                        templateUrl: "templates/active.html",
                        controller: "ActiveCtrl"
                    }
                }
            })
            // 我的
            .state('tabs.myself', {
                url: "/myself",
                cache: 'false',
                views: {
                    'tab-myself': {
                        templateUrl: "templates/myself.html",
                        controller: "MyselfCtrl"
                    }
                }
            })


            // 首页 搜索
            .state('tabs.home_search', {
                url: "/home_search",
                cache: 'true',
                views: {
                    'tab-home': {
                        templateUrl: "templates/home/home_search.html",
                        controller: 'HomeSearchCtrl'
                    }
                }
            })
            // 直播详情
            .state('tabs.livedetails', {
                url: "/livedetails",
                cache: 'false',
                views: {
                    'tab-home': {
                        templateUrl: "templates/home/livedetails.html",
                        controller: 'LiveDetailsCtrl'
                    }
                }
            })
            //余额页面
            .state('over', {
                url: "/over",
                cache: 'false',
                templateUrl: "templates/myself/over.html",
                controller: "OverCtrl"
            })
            //我的活动
            .state('my_active', {
                url: '/my_active',
                cache: 'false',
                templateUrl: 'templates/myself/my_active.html',
                controller: 'MyActiveCtrl'
            })
            //历史记录
            .state('my_history', {
                url: '/my_history',
                cache: 'false',
                templateUrl: 'templates/myself/my_history.html',
                controller: 'MyHistoryCtrl'
            })
            //我的收藏
            .state('my_collection', {
                url: '/my_collection',
                cache: 'false',
                templateUrl: 'templates/myself/my_collection.html',
                controller: 'MyCollectionCtrl'
            })
            //账户设置
            .state('my_setting', {
                url: '/my_setting',
                cache: 'false',
                templateUrl: 'templates/myself/my_setting.html',
                controller: 'MySettingCtrl'
            })
            //消费记录
            .state('consume_record', {
                url: '/consume_record',
                cache: 'false',
                templateUrl: 'templates/myself/consume_record.html',
                controller: 'MyConsumeRecordCtrl'
            })
            //资料编辑
            .state('edit_profile', {
                url: '/edit_profile',
                cache: 'false',
                templateUrl: 'templates/myself/edit_profile.html',
                controller: 'MyEditProfileCtrl'
            })
            //我的私信
            .state('private_message', {
                url: '/private_message',
                cache: 'false',
                templateUrl: 'templates/myself/my_private_message.html',
                controller: 'MyPrivateMessageCtrl'
            })
            //余额充值
            .state('rechange', {
                url: '/rechange',
                cache: 'true',
                templateUrl: 'templates/myself/rechange.html',
                controller: 'MyRechangeCtrl'
            })
            //修改密码(获取验证码)
            .state('modify_password', {
                url: '/modify_password',
                cache: 'false',
                templateUrl: 'templates/myself/modify_password.html',
                controller: 'MyModifyPasswordCtrl'
            })
            //修改密码
            .state('edit_password', {
                url: '/edit_password',
                cache: 'false',
                templateUrl: 'templates/myself/edit_password.html',
                controller: 'MyEditPasswordCtrl'
            })
            //用户反馈
            .state('user_feedback', {
                url: '/user_feedback',
                cache: 'false',
                templateUrl: 'templates/myself/user_feedback.html',
                controller: 'UserFeedbackCtrl'
            })
            //账户绑定
            .state('account_bind', {
                url: '/account_bind',
                cache: 'false',
                templateUrl: 'templates/myself/account_bind.html',
                controller: 'AccountBindCtrl'
            })
            //我的体验券
            .state('my_coupon', {
                url: '/my_coupon',
                cache: 'false',
                templateUrl: 'templates/myself/my_coupon.html',
                controller: 'MyCouponCtrl'
            })
            //活动详情
            .state('active_details', {
                url: '/active_details/{activityId}',
                cache: 'false',
                templateUrl: 'templates/active/active_details.html',
                controller: 'ActiveDetailsCtrl'
            })
            //线上沙龙详情
            .state('salon', {
                url: '/salon/{activityId}/{liveId}',
                cache: 'false',
                templateUrl: 'templates/active/salon.html',
                controller: 'SalonCtrl'
            })
            //活动报名
            .state('active_apply', {
                url: '/active_apply/{activityId}',
                cache: 'false',
                templateUrl: 'templates/active/active_apply.html',
                controller: 'ActiveApplyCtrl'
            })


            //即将直播报名 和 正在直播报名
            .state('live_apply', {
                url: '/live_apply/{liveId}',
                cache: 'false',
                templateUrl: 'templates/active/live_apply.html',
                controller: 'LiveApplyCtrl'
            })


            //即将直播详情
            .state('upcomingLiving_details', {
                url: '/upcomingLiving_details/{liveId}',
                cache: 'false',
                templateUrl: 'templates/active/upcomingLiving_details.html',
                controller: 'UpcomingLivingDetailsCtrl'
            })

            //确认订单--课程(预支付)
            .state('confirm_order_course', {
                url: '/confirm_order_course/{courseId}',
                cache: 'false',
                templateUrl: 'templates/active/confirm_order_course.html',
                controller: 'ConfirmOrderCourseCtrl'
            })
            //确认订单--课程视频、录播视频
            .state('confirm_order_video', {
                url: '/confirm_order_video/{videoId}',
                cache: 'false',
                templateUrl: 'templates/active/confirm_order_video.html',
                controller: 'ConfirmOrderVideoCtrl'
            })

            //确认订单--即将直播 和 正在直播
            .state('confirm_order_live', {
                url: '/confirm_order_live/{liveId}',
                cache: 'false',
                templateUrl: 'templates/active/confirm_order_live.html',
                controller: 'ConfirmOrderLiveCtrl'
            })
            //确认订单--直播已结束
            .state('confirm_order_livingEnded', {
                url: '/confirm_order_livingEnded/{videoId}',
                cache: 'false',
                templateUrl: 'templates/active/confirm_order_livingEnded.html',
                controller: 'ConfirmOrderLivingEndedCtrl'
            })

            //确认订单--活动(即将开始和正在进行)
            .state('confirm_order_activity', {
                url: '/confirm_order_activity/{activityId}',
                cache: 'false',
                templateUrl: 'templates/active/confirm_order_activity.html',
                controller: 'ConfirmOrderActivityCtrl'
            })
            //确认订单--活动(已结束)
            .state('confirm_order_activity_end', {
                url: '/confirm_order_activity_end/{activityId}',
                cache: 'false',
                templateUrl: 'templates/active/confirm_order_activityEnded.html',
                controller: 'ConfirmOrderActivityEndCtrl'
            })
           

            //选择体验券
            .state('change_coupon', {
                url: '/change_coupon/{orderId}',
                cache: 'false',
                templateUrl: 'templates/active/change_coupon.html',
                controller: 'ChangeCouponCtrl'
            })
            //正在直播详情
            .state('living_detail', {
                url: '/living_detail/{liveId}/{activityId}',
                cache: 'false',
                templateUrl: 'templates/progress/living_detail.html',
                controller: 'LivingDetailCtrl'
            })
            //录播课程列表
            .state('recorded_list', {
                url: '/recorded_list/{courseId}',
                cache: 'false',
                templateUrl: 'templates/progress/recorded_list.html',
                controller: 'RecordedListCtrl'
            })
            // 视频详情(课程的视频、录播视频、直播已结束转录播的视频、活动视频共同页面)
            .state('video', {
                url: '/video/{videoId}',
                cache: false,
                templateUrl: 'templates/progress/video.html',
                controller: 'VideoCtrl'
            })


            //忘记密码
            .state('forget_password', {
                url: '/forget_password',
                cache: 'false',
                templateUrl: 'templates/user/forget_password.html',
                controller: 'ForgetPasswordCtrl'
            })
            //充值记录
            .state('rechange_record', {
                url: '/rechange_record',
                cache: 'false',
                templateUrl: 'templates/myself/rechange_record.html',
                controller: 'RechangeRecordCtrl'
            })

            //确认订单--充值
            .state('confirm_pay', {
                url: '/confirm_pay',
                cache: 'true',
                templateUrl: 'pay/alipay/confirm_pay.html',
                controller: 'ConfirmPayCtrl'
            })

            //确认支付--支付宝
            .state('alipay', {
                url: '/alipay/{orderId}/{orderCode}/{orderTurnover}/{description}',
                cache: true,
                templateUrl: 'pay/alipay/pay.html',
                controller: 'AlipayCtrl'
            })
            //确认支付--余额
            .state('course_order', {
                url: '/course_order/{orderId}/{orderCode}/{orderTurnover}/{description}',
                cache: 'false',
                templateUrl: 'pay/balance/course_order.html',
                controller: 'CourseOrderCtrl'
            })
            //确认支付--微信二维码
            .state('order_wechat', {
                url: '/order_wechat/{orderId}/{orderCode}/{orderTurnover}/{description}',
                cache: 'false',
                templateUrl: 'pay/wechat/order_wechat.html',
                controller: 'OrderWechatCtrl'
            })
        $urlRouterProvider.otherwise('/tab/home');
    });