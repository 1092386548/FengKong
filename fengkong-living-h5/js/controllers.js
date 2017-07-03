angular.module('starter.controllers', ['ionic'])
    // .filter('trustedUrl', function ($sce) {
    //     return function (url) {
    //         return $sce.trustAsResourceUrl(url);
    //     }
    // })

    /*.config(function ($stateProvider, $urlRouterProvider,$ionicConfigProvider) {  
        $ionicConfigProvider.views.maxCache(0);
    })*/

    .constant('ApiEndpoint', {
        // url: 'http://www.igmhz.com/fengkong-server/'
        url: 'http://localhost:8080/fengkong-server/'
    })
    .controller('TabCtrl', function ($scope, $rootScope, $ionicLoading, $timeout, $ionicHistory, $state) {
        // 隐藏tabs
        $rootScope.$on('$ionicView.beforeEnter', function () {
            var statename = $state.current.name;
            //tabs中存在的主页面不需要隐藏，hidetabs=false
            if (statename === 'tabs.myself' || statename === 'tabs.home' || statename === 'tabs.progress' || statename === 'tabs.progress1' || statename === 'tabs.record' || statename === 'tabs.active') {
                $rootScope.hideTabs = false;
            } else {
                $rootScope.hideTabs = true;
            }
        })


        $scope.goHome = function () {
            $state.go("tabs.home");
        }
        $scope.goProgress = function () {
            $state.go("tabs.progress");
        }
        $scope.goActive = function () {
            $state.go("tabs.active");
        }
        $scope.goMySelf = function () {
            if (localStorage.userId) {
                $state.go('tabs.myself');
            } else {
                $state.go('login');
            }
        }

        $scope.showError = function () {
            $ionicLoading.show({
                template: '系统繁忙，请稍后再试'
            });
        }
        $scope.showPop = function (text) {
            $ionicLoading.show({
                template: text
            });
            $timeout(function () {
                $ionicLoading.hide();
            }, 1500)
        };

    })


    .controller('HomeCtrl', function ($scope, $ionicLoading, $timeout, $ionicHistory, $state, $http, ApiEndpoint) {
        console.log($ionicHistory.viewHistory());
        if ($ionicHistory.viewHistory().backView != null) {
            console.log($ionicHistory.viewHistory().backView.stateName);
        }

        function getBanner() {
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'banner/getBannerList.do',
                data: $.param({
                    activated: 1,
                    type: 1,
                    pageNum: 1,
                    pageSize: 10
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    $scope.bannerList = data.result;
                    $timeout(function () {
                        var mySwiper = new Swiper('.swiper-container', {
                            direction: 'horizontal',
                            pagination: '.swiper-pagination',
                            autoplay: 3000,
                            loop: true,
                            observer: true,//修改swiper自己或子元素时，自动初始化swiper
                            observeParents: true,//修改swiper的父元素时，自动初始化swiper
                        })
                    }, 0)
                }
            })
        }
        getBanner();


        /*
         * 获取近期直播liveList、线下培训activityList、推荐课程courseList
         */
        $http({
            method: 'POST',
            url: ApiEndpoint.url + 'home/getNowTime.do',
            data: $.param({}),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function (data) {
            if (data.errorCode == 0) {
                var time = data.result;


                $http({
                    method: 'POST',
                    url: ApiEndpoint.url + 'homePage/homePageH5.do',
                    data: $.param({
                        type: 0
                    }),
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                }).success(function (data) {
                    if (data.errorCode == 0) {
                        $scope.liveList = [];//近期直播
						$scope.activityList = [];//线下培训
						$scope.courseList = [];//推荐课程

                        angular.forEach(data.result, function (value, key) {
                            if (key == 'liveList') {
                                var tmpLiveList = data.result[key];
                                
                                angular.forEach(tmpLiveList, function (value) {
                                    if (time >= value.activity.activityStartTime && time <= value.activity.activityEndTime) {
                                        //正在直播
                                        value.newLiveStatus = 1;
                                        $scope.liveList.push(value);
                                    } else if (time < value.activity.activityStartTime) {
                                        // 即将直播
                                        value.newLiveStatus = 0;
                                        $scope.liveList.push(value);
                                    } else if (time > value.activity.activityEndTime) {
                                        // 直播已结束
                                        value.newLiveStatus = 2;
                                    }
                                })

                                
                                //首页只展示2个
                                if ($scope.liveList.length > 2) {
                                    $scope.liveList.length = 2;
                                }

                            } else if (key == 'activityList') {
                                $scope.activityList = data.result[key];

                                if ($scope.activityList.length > 2) {
                                    $scope.activityList.length = 2;
                                }
                            } else if (key == 'courseList') {
                                $scope.courseList = data.result[key];

                                if ($scope.courseList.length > 2) {
                                    $scope.courseList.length = 2;
                                }
                            }
                        })
                    }
                })
            }
        })



        $scope.homeBtn = function (id) {
            $state.go('tabs.progress', {
                homeBtn: id
            });
        }
        $scope.onlineSalon = function () {
            $state.go('tabs.active', {
                tab: 2
            });
        }

    })


    //课程
    .controller('ProgressCtrl', function ($scope, $http, $state, $stateParams, $ionicHistory,$timeout, ApiEndpoint) {
        console.log($ionicHistory.viewHistory());
        if ($ionicHistory.viewHistory().backView != null) {
            console.log($ionicHistory.viewHistory().backView.stateName);
        }

        /*if (localStorage.userId == undefined) {
            $state.go('login');
            return;
        }*/


        $scope.doRefresh = function() {
            getAllLiveList();
            $timeout(function() {
                $scope.$broadcast('scroll.refreshComplete');
            }, 1000);
        };


        function getAllLiveList() {
            //获取时间戳
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'home/getNowTime.do',
                data: $.param({}),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    var time = data.result;

                    //直播
                    $http({
                        method: 'POST',
                        url: ApiEndpoint.url + 'live/getAllLiveList.do',
                        data: $.param({
                            pageNum: 1,
                            pageSize: 10
                        }),
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                    }).success(function (data) {
                        if (data.errorCode == 0) {
                            // 正在直播
                            $scope.livingList = [];
                            // 即将直播
                            $scope.beforeLivingList = [];
                            // 直播已结束
                            $scope.afterLivingList = [];


                            // 获取所有视频后分离正在直播、即将直播、直播已结束
                            angular.forEach(data.result.LiveList, function (value) {
                                if (time >= value.activity.activityStartTime && time <= value.activity.activityEndTime) {
                                    //正在直播
                                    $scope.livingList.push(value);
                                    value.newLiveStatus = 1;
                                } else if (time < value.activity.activityStartTime) {
                                    // 即将直播
                                    $scope.beforeLivingList.push(value);
                                    value.newLiveStatus = 0;
                                } else if (time > value.activity.activityEndTime) {
                                    // 直播已结束
                                    $scope.afterLivingList.push(value);
                                    value.newLiveStatus = 2;
                                }
                            })

                            console.log($scope.livingList);
                            console.log($scope.beforeLivingList);
                            console.log($scope.afterLivingList);

                            $timeout(function(){
                                var swiperContainerProgress = new Swiper('.swiper-container-progress', {
                                    autoplay: 4000,
                                    loop: true,
                                    pagination: '.swiper-pagination',
                                    observer: true,//修改swiper自己或子元素时，自动初始化swiper
                                    observeParents: true,//修改swiper的父元素时，自动初始化swiper
                                });
                            },0);
                        }
                    })
                }
            })
        }
        getAllLiveList();




        /*
         *  enrollStatus(报名状态):0未报名  1已报名
         * 
         *  orderStatus: 1未支付  2已支付  3已报名
         * 即将直播的orderStatus可能为1或3,正在直播的orderStatus可能为1或2,已结束的orderStatus可能为1或2或3
         * 只有即将直播和正在直播无论免费还是收费都需先去报名来获取报名人数,直播已结束收费且未付费则直接进入确认订单页面
        */
        //即将直播  点击'已报名'后判断
        // $scope.upcomingLivingApply = function (liveId, liveName, livePrice, orderStatus) {
        //     console.log('price ' + livePrice);
        //     console.log('orderStatus ' + orderStatus);

        //     if (orderStatus == 1) {
        //         console.log('即将直播已报名但未支付');
        //         $state.go('confirm_order_live', {
        //             liveId: liveId
        //         });
        //     } else if (orderStatus == 2) {
        //         console.log('即将直播已报名且已支付');
        //         $state.go('upcomingLiving_details', {
        //             liveId: liveId
        //         })
        //     }
        // }


        // 点击即将直播和正在直播的图片封面
        // 点击后先根据报名状态判断,未报名再根据用户付费状态判断
        // $scope.notLivingEnd = function (liveId,videoId, livePrice, enrollStatus, orderStatus,activityId) {
        //     console.log('liveId: '+liveId);
        //     // 判断直播是否结束，正在直播已结束需要跳转到已结束视频
        //     $http({
        //         method: 'POST',
        //         url: ApiEndpoint.url + 'live/getLiveIsEnd.do',
        //         data: $.param({
        //             liveId: liveId
        //         }),
        //         headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        //     }).success(function (data) {
        //         if (data.errorCode == 0) {
        //             // 1==》直播结束，2==》直播中，3==》即将直播
        //             var latestLiveStatus = data.result;
        //             console.log(latestLiveStatus,111111111111);

        //             //即将直播
        //             if (latestLiveStatus == 3) {
        //                 if (enrollStatus == 0) {
        //                     console.log('即将直播未报名');
        //                     /*$state.go('live_apply', {
        //                         liveId: liveId
        //                     });*/
        //                     $state.go('active_apply', {
        //                         activityId: activityId
        //                     });
        //                 } else if (enrollStatus == 1) {
        //                     if (orderStatus == 1) {
        //                         console.log('即将直播已报名但未支付');
        //                         /*$state.go('confirm_order_live', {
        //                             liveId: liveId
        //                         });*/
        //                         $state.go('confirm_order_activity', {
        //                             activityId: activityId
        //                         });
        //                     } else if (orderStatus == 2) {
        //                         console.log('即将直播已报名且已支付');
        //                         $state.go('upcomingLiving_details', {
        //                             liveId: liveId
        //                         })
        //                     }
        //                 }

        //             }
        //             // 正在直播
        //             else if (latestLiveStatus == 2) {
        //                 if (enrollStatus == 0) {
        //                     console.log('正在直播未报名');
        //                     /*$state.go('live_apply', {
        //                         liveId: liveId
        //                     });*/
        //                     $state.go('active_apply', {
        //                         activityId: activityId
        //                     });
        //                 } else if (enrollStatus == 1) {
        //                     if (orderStatus == 1) {
        //                         console.log('正在直播已报名但未支付');
        //                         $state.go('confirm_order_live', {
        //                             liveId: liveId
        //                         });

        //                     } else if (orderStatus == 2) {
        //                         console.log('正在直播已报名且已支付');
        //                         $state.go('living_detail', {
        //                             liveId: liveId
        //                         });
        //                     }
        //                 }
        //             }


        //             // 直播结束
        //             else if (latestLiveStatus == 1) {
        //                 if (livePrice == 0) {
        //                     console.log('直播已结束免费');
        //                     $state.go('video', {
        //                         videoId: videoId
        //                     });
        //                 } else if (livePrice > 0) {
        //                     if (orderStatus == 1) {
        //                         console.log('直播已结束收费且未付费');
        //                         $state.go('confirm_order_livingEnded', {
        //                             videoId: videoId
        //                         });
        //                     } else if (orderStatus == 2) {
        //                         console.log('直播已结束不免费但已付费');
        //                         $state.go('video', {
        //                             videoId: videoId
        //                         });
        //                     }
        //                 }
        //             }

        //         }
        //     })
        // }



       
        //默认显示直播
        $scope.selectedLivingRecorded = 1;
        //直播和录播切换
        $scope.selectLivingRecorded = function (status) {
            $scope.selectedLivingRecorded = status;
        }
        

        //是否点击'类别'或者'价格'对课程或视频进行筛选
        $scope.filterStatus = false;


        /**
         * 类别(typeId)
         *     类别(全部)0
         *     内控1
         *     审计2
         *     财务3
         *     税务4
         *     风控5
         * 价格(priceId)
         *     免费0
         *     收费1
         *     价格(全部)2
         */
        $scope.typeId = 0;//默认类别(全部)
        $scope.priceId = 2;//默认价格(全部)
        //录播 获取所有课程
        function getAllCourses() {
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'course/getCourseListForH5.do',
                data: $.param({
                    pageNum: 1,
                    pageSize: 10,
                    courseType:$scope.typeId,
                    coursePrice:$scope.priceId
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    $scope.filtedCourses = data.result;

                    $scope.isRecommendCourseList = [];
                    $scope.notRecommendCourseList = [];

                    // 获取所有课程后分离是否为推荐课程
                    angular.forEach(data.result, function (value) {
                        if (value.isRecommend == 1) {
                            $scope.isRecommendCourseList.push(value);
                        } else {
                            $scope.notRecommendCourseList.push(value);
                        }
                    })
                }
            })
        }

        //录播 获取所有视频(未点击类别时typeId为0,未点击价格时priceId为2)
        function getAllVideos() {
            console.log($scope.typeId,$scope.priceId);
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'video/getAllNotCourseVideo.do',
                data: $.param({
                    userId: localStorage.userId,
                    type: $scope.typeId,
                    price: $scope.priceId
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    $scope.filtedVideos = data.result;

                    $scope.isRecommendVideoList = [];
                    $scope.notRecommendVideoList = [];

                    // 获取所有视频后分离是否为推荐视频(1:推荐 0:不推荐)
                    angular.forEach(data.result, function (value) {
                        if (value.videoRecommend == 1) {
                            $scope.isRecommendVideoList.push(value);
                        } else if (value.videoRecommend == 0) {
                            $scope.notRecommendVideoList.push(value);
                        }
                    })
                }
            })
        }

        /*类别开始*/
        $scope.typeOpts = [
            {
                id:0,
                name:'类别'
            },
            {
                id: 1,
                name: '内控'
            },
            {
                id: 2,
                name: '审计'
            },
            {
                id:3,
                name: '财务'
            },
            {
                id:4,
                name: '税务'
            },
            {
                id:5,
                name: '风控'
            }
        ];


        $scope.typeData = {};
        $scope.typeData.typeId = 0;//默认显示类别
        //通过类型筛选课程或视频(选择任何一个类别后删除'类别')
        $scope.getTypesId = function(typeId){
            $scope.filterStatus = true;

            $scope.typeId = typeId;

            // 通过类型筛选课程
            getAllCourses();
            
            // 通过类型筛选视频
            getAllVideos();
        }
        /*类别结束*/


        /*价格开始*/
        $scope.priceOpts = [
            {
                id: 2,
                name:'价格'
            },
            {
                id:1,
                name:'收费'
            },
            {
                id: 0,
                name: '免费'
            }
        ];
        $scope.priceData = {};
        $scope.priceData.priceId = 2;//默认显示价格
        
        $scope.getPricesId = function(priceId){
            $scope.filterStatus = true;

            $scope.priceId = priceId;

            // 通过价格筛选课程
            getAllCourses();

            // 通过价格筛选视频
            getAllVideos();
        }
        /*价格结束*/



        var homeBtn = $stateParams.homeBtn;

        if(homeBtn == ''){
            $scope.selectedLivingRecorded = 1;//显示直播
        }else if(homeBtn != ''){
            
            if (homeBtn == 0) {//点击首页的推荐课程的'更多'过来的,需要显示录播
                $scope.selectedLivingRecorded = 2;//显示录播
                getAllCourses();
            }else if(homeBtn == 1){
                // 点击首页'内控'跳转至录播对应'内控筛选'课程
                $scope.selectedLivingRecorded = 2;
                $scope.typeData.typeId = 1;
                $scope.getTypesId(1);
            }else if(homeBtn == 2){
                // 点击首页'审计'跳转至录播对应'审计筛选'课程
                $scope.selectedLivingRecorded = 2;
                $scope.typeData.typeId = 2;
                $scope.getTypesId(2);
            }else if(homeBtn == 3){
                // 点击首页'财务'跳转至录播对应'财务筛选'课程
                $scope.selectedLivingRecorded = 2;
                $scope.typeData.typeId = 3;
                $scope.getTypesId(3);
            }else if(homeBtn == 4){
                // 点击首页'税务'跳转至录播对应'税务筛选'课程
                $scope.selectedLivingRecorded = 2;
                $scope.typeData.typeId = 4;
                $scope.getTypesId(4);
            }else if(homeBtn == 5){
                // 点击首页'风控'跳转至录播对应'风控筛选'课程
                $scope.selectedLivingRecorded = 2;
                $scope.typeData.typeId = 5;
                $scope.getTypesId(5);
            }

        }


        //录播 课程视频切换
        $scope.courseVideos = [
            {
                id: 1,
                name: '课程'
            },
            {
                id: 2,
                name: '视频'
            }
        ]
        //默认为课程
        $scope.formData = {};
        $scope.formData.courseVideoId = 1;

        //录播 默认获取所有课程
        $('.header_tab_right').click(function () {
            $scope.formData.courseVideoId = 1;

            getAllCourses();

            $('#progress_progress').show();
            $('#progress_video').hide();
            $('#progress_type').hide();
            $('#progress_price').hide();
        })

        $('.header_tab_left').click(function () {
            getAllLiveList();
        })


        

        $scope.getCourseVideoId = function (id) {
            $scope.filterStatus = false;

            $scope.typeData.typeId = 0;//默认显示类别
            $scope.priceData.priceId = 2;//默认显示价格


            switch (id) {
                case 1:
                    $scope.typeId = 0;
                    $scope.priceId = 2;
                    getAllCourses();
                    break;
                case 2:
                    $scope.typeId = 0;
                    $scope.priceId = 2;
                    getAllVideos();
                    break;
            }
        }

    })



    // 活动
    .controller('ActiveCtrl', function ($scope, $ionicLoading, $timeout, $ionicHistory, $state, $http,$stateParams, ApiEndpoint) {
        console.log($ionicHistory.viewHistory());
        if ($ionicHistory.viewHistory().backView != null) {
            console.log($ionicHistory.viewHistory().backView.stateName);
        }

        $scope.activityWay = 0;

        var tab = $stateParams.tab;
        if($stateParams.tab){
            $scope.activityWay = 3;
            
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'home/getNowTime.do',
                data: $.param({}),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    var time = data.result;
                    console.log(time,new Date(time));

                    $http({
                        method: 'POST',

                        url: ApiEndpoint.url + 'activity/getShalongActivityList.do',
                        data: $.param({}),

                        /*url: ApiEndpoint.url + 'activity/getAllActivityList.do',
                        data: $.param({
                            activityWay:activityWay
                        }),*/

                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                    }).success(function (data) {
                        if (data.errorCode == 0) {
                            var tmpList = data.result;
                            console.log(data.result);
                            $scope.onlineSalonList = [];
                            // 过滤掉已结束的
                            // newActivityStatus(活动状态):1即将开始(报名中)  2正在进行  3已结束
                            angular.forEach(tmpList,function(value){
                                if (time < value.activityStartTime) {
                                    // 即将开始
                                    value.newActivityStatus = 1;
                                    $scope.onlineSalonList.push(value);
                                } else if (time >= value.activityStartTime && time <= value.activityEndTime) {
                                    // 正在进行
                                    value.newActivityStatus = 2;
                                    $scope.onlineSalonList.push(value);
                                }
                            })
                            console.log($scope.onlineSalonList);

                        }
                    })
                }
            })

        }

        

        function getActivityList(activityWay) {
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'home/getNowTime.do',
                data: $.param({}),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    var time = data.result;

                    $http({
                        method: 'POST',
                        url: ApiEndpoint.url + 'activity/getAllActivityList.do',
                        data: $.param({
                            activityWay: activityWay
                        }),
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                    }).success(function (data) {
                        if (data.errorCode == 0) {
                            $scope.activityList = data.result;
                            console.log($scope.activityList);
                            // newActivityStatus(活动状态):1即将开始(报名中)  2正在进行  3已结束

                            // 只有'全部'有'推荐活动',其余3个(特训营、公开课、线上沙龙)没有推荐活动使用瀑布式展示;'全部'的'近期活动'不包含已结束的活动并且优先放正在直播然后放即将直播
                            $scope.recommendedActivityList = [];//推荐活动--作为'全部'的轮播图
                            $scope.recentActivityBeforeLiving = [];//近期活动--即将直播
                            $scope.recentActivityLiving = [];//近期活动--正在直播

                            // activated(推荐状态,默认不推荐):0不推荐  1推荐
                            angular.forEach($scope.activityList, function (value) {
                                if (value.activated == 0) {
                                    if (time < value.activityStartTime) {
                                        // 即将直播
                                        $scope.recentActivityBeforeLiving.push(value);
                                        value.newActivityStatus = 1;
                                    } else if (time >= value.activityStartTime && time <= value.activityEndTime) {
                                        // 正在直播
                                        $scope.recentActivityLiving.push(value);
                                        value.newActivityStatus = 2;
                                    }
                                } else if (value.activated == 1) {
                                    $scope.recommendedActivityList.push(value);

                                    if (time < value.activityStartTime) {
                                        // 即将直播
                                        value.newActivityStatus = 1;
                                    } else if (time >= value.activityStartTime && time <= value.activityEndTime) {
                                        // 正在直播
                                        value.newActivityStatus = 2;
                                    } else if (time > value.activityEndTime) {
                                        // 已结束
                                        value.newActivityStatus = 3;
                                    }
                                }
                            })
console.log($scope.recommendedActivityList);

                            $timeout(function () {
                                var swiperContainerActivity = new Swiper('#swiper-container-activity', {
                                    autoplay: 4000,
                                    loop: true,
                                    pagination: '.swiper-pagination',
                                    observer: true,//修改swiper自己或子元素时，自动初始化swiper
                                    observeParents: true,//修改swiper的父元素时，自动初始化swiper
                                });
                            }, 0)
                        }
                    })
                }
            })
        }

        getActivityList(0);


        $scope.setActivityWay = function (activityWay) {
            $scope.activityWay = activityWay;

            getActivityList(activityWay);
        }
        // 线上沙龙(不展示已结束活动，只展示即将开始和正在直播的)
        $scope.onlineSalon = function(activityWay){
            $scope.activityWay = activityWay;

            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'home/getNowTime.do',
                data: $.param({}),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    var time = data.result;
                    console.log(time,new Date(time));

                    $http({
                        method: 'POST',

                        url: ApiEndpoint.url + 'activity/getShalongActivityList.do',
                        data: $.param({}),

                        /*url: ApiEndpoint.url + 'activity/getAllActivityList.do',
                        data: $.param({
                            activityWay:activityWay
                        }),*/

                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                    }).success(function (data) {
                        if (data.errorCode == 0) {
                            var tmpList = data.result;
                            $scope.onlineSalonList = [];
                            // 过滤掉已结束的
                            // newActivityStatus(活动状态):1即将开始(报名中)  2正在进行  3已结束
                            angular.forEach(tmpList,function(value){
                                if (time < value.activityStartTime) {
                                    // 即将开始
                                    value.newActivityStatus = 1;
                                    $scope.onlineSalonList.push(value);
                                } else if (time >= value.activityStartTime && time <= value.activityEndTime) {
                                    // 正在进行
                                    value.newActivityStatus = 2;
                                    $scope.onlineSalonList.push(value);
                                }
                            })
                            console.log(data.result);
                            console.log($scope.onlineSalonList);

                        }
                    })
                }
            })
        }

    })

    .controller('MyselfCtrl', function ($ionicActionSheet, $scope, $state, $http, $rootScope, $ionicHistory, $location, $interval, $ionicPopup, ApiEndpoint, PopService) {
        console.log($ionicHistory.viewHistory());
        if ($ionicHistory.viewHistory().backView != null) {
            console.log($ionicHistory.viewHistory().backView.stateName);
        }


        $http({
            method: 'POST',
            url: ApiEndpoint.url + 'user/getUserByUserId.do',
            data: $.param({
                userId: localStorage.userId
            }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function (data) {
            if (data.errorCode == 0) {
                $scope.userInfo = data.result;
                console.log($scope.userInfo);
            }
        })


        // 得到用户的优惠券数量和用户的余额
        $http({
            method: 'POST',
            url: ApiEndpoint.url + 'home/getUserCouponNumberAndBalance.do',
            data: $.param({
                userId: localStorage.userId
            }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function (data) {
            if (data.errorCode == 0) {
                $scope.couponNumber = data.result.couponNumber;
                $scope.userBalance = data.result.userBalance.toFixed(2);
            }
        })

        // 兑换码
        $scope.showPopup = function () {
            $scope.data = {};

            // 自定义弹窗
            var myPopup = $ionicPopup.show({
                template: '<input type="text" ng-model="data.exchangeCode" placeholder="请输入兑换码" style="border-radius:5px;">',
                title: '<b>优惠兑换</b>',
                subTitle: '',
                scope: $scope,
                buttons: [//Array[Object] (可选)。放在弹窗footer内的按钮
                    {
                        text: '取消',
                        type: 'button-default',
                        onTap: function (e) {
                            // 当点击时，e.preventDefault() 会阻止弹窗关闭
                            // e.preventDefault();
                        }
                    },
                    {
                        text: '确定',
                        type: 'button-default',
                        onTap: function (e) {
                            // 返回的值会导致处理给定的值
                            e.preventDefault();

                            if ($scope.data.exchangeCode != undefined && $scope.data.exchangeCode != '') {
                                $http({
                                    method: 'POST',
                                    url: ApiEndpoint.url + 'redeemCode/exchangeGoods.do',
                                    data: $.param({
                                        userId: localStorage.userId,
                                        exchangeCode: $scope.data.exchangeCode
                                    }),
                                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                                }).success(function (data) {
                                    if (data.errorCode == 0) {
                                        myPopup.close();

                                        // redeemType兑换码类型: 1优惠券  2虚拟商品货币
                                        if (data.result.redeemType == 1) {
                                            var codeDescription = data.result.codeDescription;

                                            var myPopup1 = $ionicPopup.alert({
                                                title: '<h4>兑换成功!</h4>', // String. 弹窗的标题
                                                subTitle: '', // String (可选)。弹窗的子标题
                                                template: '<div style="text-align:center">成功兑换一张<span style="color:#f00;">' + codeDescription + '</span></div>', // String (可选)。放在弹窗body内的html模板
                                                templateUrl: '', // String (可选)。 放在弹窗body内的html模板的URL
                                                okText: '去看看', // String (默认: 'OK')。OK按钮的文字
                                                okType: 'button-clear button-assertive', // String (默认: 'button-positive')。OK按钮的类型
                                            });
                                            myPopup1.then(function (res) {
                                                if (res) {
                                                    $('.popup-container').hide();
                                                    $state.go('my_coupon');
                                                }
                                            })
                                        } else if (data.result.redeemType == 2) {
                                            var codeDescription = data.result.codeDescription;

                                            var myPopup2 = $ionicPopup.alert({
                                                title: '<h4>兑换成功!</h4>', // String. 弹窗的标题。
                                                subTitle: '', // String (可选)。弹窗的子标题。
                                                template: '<div style="text-align:center">成功兑换风控币<span style="color:#f00;">' + codeDescription + '</span></div>' +
                                                '<div style="text-align:center;color:#ccc;font-size:12px;">可到账户充值记录查询</div>', // String (可选)。放在弹窗body内的html模板
                                                templateUrl: '', // String (可选)。 放在弹窗body内的html模板的URL
                                                okText: '去看看', // String (默认: 'OK')。OK按钮的文字
                                                okType: 'button-clear button-assertive', // String (默认: 'button-positive')。OK按钮的类型
                                            });
                                            myPopup2.then(function (res) {
                                                if (res) {
                                                    $('.popup-container').hide();
                                                    $state.go('over');
                                                }
                                            })
                                        }
                                    }
                                })
                            } else {
                                PopService.showPop('兑换码不能为空');
                            }
                        }
                    }
                ]
            });

            myPopup.then(function (res) {
                console.log('Tapped!', res);
            });
        };
    })


    //搜索页面
    .controller('HomeSearchCtrl', function ($scope, $ionicLoading, $timeout, $ionicHistory, $state, $http, ApiEndpoint) {
        console.log($ionicHistory.viewHistory());
        if ($ionicHistory.viewHistory().backView != null) {
            console.log($ionicHistory.viewHistory().backView.stateName);
        }

        $scope.l = [1, 2, 3, 4, 5, 6, 7];

        $scope.type = 1;
        $scope.getType = function (type_id) {
            $scope.type = type_id;
        }
        $('.col-33').click(function (event) {
            $(this).addClass('b1').siblings().removeClass('b1');
        });


        $scope.goBack = function () {
            $ionicHistory.goBack();
        }


        function search() {
            console.log($scope.searchName);
            $http.post(ApiEndpoint.url + "homePage/homePageSearch.do", {}, {
                params: {
                    userId: localStorage.userId,
                    serachName: $scope.searchName
                }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    $scope.courseList = [];
                    $scope.videoList = [];
                    $scope.activityList = [];

                    angular.forEach(data.result, function (value, key) {
                        if (key == 'courseList') {
                            $scope.courseList = data.result[key];
                        } else if (key == 'videoList') {
                            $scope.videoList = data.result[key];
                        } else if (key == 'activityList') {
                            $scope.activityList = data.result[key];
                        }
                    })
                }
            })
        }
        search();

        $scope.clickToSearch = function () {
            search();
        }

    })

    .controller('LoginCtrl', function ($scope, $rootScope, $http, $timeout, $ionicLoading, $ionicHistory, $state, ApiEndpoint, PopService) {
        console.log($ionicHistory.viewHistory());
        if ($ionicHistory.viewHistory().backView != null) {
            console.log($ionicHistory.viewHistory().backView.stateName);
        }

        $('.loginbutton>button').click(function (event) {
            $(this).addClass('logincolor').siblings().removeClass('logincolor');
        });

        $scope.loginTab = 1;


        $scope.user = { userName: '', password: '' };

        // 普通登录
        $scope.login = function () {

            if (!$scope.user.userName) {
                PopService.showPop('用户名不能为空');
                return false;
            } else if (!$scope.user.password) {
                PopService.showPop('密码不能为空');
                return false;
            } else {
                $http({
                    method: 'POST',
                    url: ApiEndpoint.url + 'user/login.do',
                    data: $.param({
                        userName: $scope.user.userName,
                        password: $scope.user.password
                    }),
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                }).success(function (data) {
                    alert(data.errorCode);
                    if (data.errorCode == 0) {
                        localStorage.user = JSON.stringify(data.result);
                        localStorage.userId = data.result.userId;
                        localStorage.userName = data.result.userName;

                        PopService.showPop('登录成功');

                        if ($ionicHistory.viewHistory().backView != null) {
                            $ionicHistory.goBack();
                        } else if ($ionicHistory.viewHistory().backView == null) {
                            $state.go('tabs.home');
                            /*if($ionicHistory.viewHistory().backView.stateName == 'login'){
                            }*/
                        }
                    } else {
                        PopService.showPop(data.errorMessage);
                    }
                })
            }

        }
        // 短信登录
        // 获取验证码
        $scope.getCode1 = true;
        $scope.timer = 60;
        $scope.timerCode = function () {
            $timeout.cancel($scope.timer1);
            if ($scope.timer == 0) {
                $scope.getCode1 = true;
                $scope.timer = 60;
            } else {
                $scope.timer--;
                $scope.timer1 = $timeout(function () {
                    $scope.timerCode();
                }, 1000)
            }
        }
        $scope.user = { mobile: '', authcode: '' }
        $scope.getCode = function () {
            $http.post(ApiEndpoint.url + 'user/genAuthCode.do', {}, {
                params: {
                    mobile: $scope.user.mobile,
                    type: 2
                }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    $scope.code = data.result;
                    $scope.getCode1 = false;
                    $timeout.cancel($scope.timer2);
                    $scope.timer2 = $timeout(function () {
                        $scope.timerCode();
                    }, 1000);
                }
            })
        }
        $scope.submit = function () {
            if (!$scope.user.mobile) {
                PopService.showPop('手机号码不能为空');
            } else if (!$scope.user.authcode) {
                PopService.showPop("验证码不能为空");
            } else {
                if ($scope.code == undefined) {
                    PopService.showPop("请先获取验证码");
                } else if ($scope.code != $scope.user.authcode) {
                    PopService.showPop("验证码错误");
                } else {
                    $http.post(ApiEndpoint.url + 'user/messageLogin.do', {}, {
                        params: {
                            mobile: $scope.user.mobile,
                            authcode: $scope.user.authcode
                        }
                    }).success(function (data) {
                        if (data.errorCode == 0) {
                            localStorage.user = JSON.stringify(data.result);
                            localStorage.userId = data.result.userId;
                            localStorage.userName = data.result.userName;
                            localStorage.password = data.result.password;

                            $state.go('tabs.myself');
                        } else {
                            PopService.showPop(data.errorMessage);
                        }
                    })
                }
            }

        }

    })

    //注册
    .controller('RegisterCtrl', function ($scope, $http, $timeout, ApiEndpoint, $state, PopService) {
        $scope.getCode1 = true;
        $scope.timer = 60;
        $scope.timerCode = function () {
            $timeout.cancel($scope.timer1);
            if ($scope.timer == 0) {
                $scope.getCode1 = true;
                $scope.timer = 60;
            } else {
                $scope.timer--;
                $scope.timer1 = $timeout(function () {
                    $scope.timerCode();
                }, 1000)
            }
        }
        $scope.registerData = { mobile: '', authcode: '', password: '', rpassword: '', nickName: '' }
        $scope.getCode = function () {
            $http.post(ApiEndpoint.url + 'user/genAuthCode.do', {}, {
                params: {
                    mobile: $scope.registerData.mobile,
                    type: 2
                }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    $scope.code = data.result;
                    $scope.getCode1 = false;
                    $timeout.cancel($scope.timer2);
                    $scope.timer2 = $timeout(function () {
                        $scope.timerCode();
                    }, 1000);
                }
            })
        }

        $scope.submit = function () {
            if (!$scope.registerData.mobile) {
                PopService.showPop('手机号码不能为空');
            } else if (!$scope.registerData.authcode) {
                PopService.showPop("验证码不能为空");
            } else if (!$scope.registerData.password) {
                PopService.showPop("密码不能为空");
            } else if (!$scope.registerData.rpassword) {
                PopService.showPop("重复密码不能为空");
            } else if ($scope.registerData.password.length < 6) {
                PopService.showPop("密码的位数不能小于6位");
            } else if ($scope.registerData.rpassword != $scope.registerData.password) {
                PopService.showPop("两次输入的密码不相同");
            } else {
                $http.post(ApiEndpoint.url + 'user/register.do', {}, {
                    params: {
                        mobile: $scope.registerData.mobile,
                        password: $scope.registerData.password,
                        authcode: $scope.registerData.authcode,
                        userName: $scope.registerData.userName
                    }
                }).success(function (data) {
                    if (data.errorCode == 0) {
                        // localStorage.user = JSON.stringify(data.result);
                        localStorage.userId = data.result.userId;
                        localStorage.userName = data.result.userName;
                        PopService.showPop('注册成功，已登录');
                        $state.go('tabs.home');
                    } else {
                        PopService.showPop(data.errorMessage);
                    }
                })
            }
        }
    })


    .controller('LiveDetailsCtrl', function ($scope) {
        $scope.good = 0;
    })


    .controller('RecordCtrl', function ($scope, $ionicHistory) {
        $('.record_navigation_all').on('click', function () {
            $('.record_navigation_all').removeClass('select');
            $(this).addClass('select');
        })
        $scope.goBack = function () {
            //$ionicHistory.goBack();
            $ionicHistory.goBack();

        }
    })


    //余额
    .controller('OverCtrl', function ($scope, $ionicHistory, $http, ApiEndpoint) {
        $scope.goBack = function () {
            $ionicHistory.goBack();
        }

        // 得到用户的优惠券数量和用户的余额
        $http({
            method: 'POST',
            url: ApiEndpoint.url + 'home/getUserCouponNumberAndBalance.do',
            data: $.param({
                userId: localStorage.userId
            }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function (data) {
            if (data.errorCode == 0) {
                $scope.userBalance = data.result.userBalance.toFixed(2);
            }
        })

    })


    //我的活动
    .controller('MyActiveCtrl', function ($scope, $ionicHistory, $http, ApiEndpoint) {
        $scope.goBack = function () {
            $ionicHistory.goBack();
        }

        $scope.progressType = function (typeId) {
            $scope.type_id = typeId;
            $scope.navIndex = 2;
            $('.down-list').hide();
        }

        $scope.progressPrice = function (priceId) {
            $scope.price_id = priceId;
            $scope.navIndex = 3;
            $('.down-list').hide();
        }

        $('.dropdownType').on('click', function () {
            $(this).next('.down-list').toggle();
            $('.dropdownPrice').next('.down-list').hide();
        })

        $('.dropdownPrice').on('click', function () {
            $(this).next('.down-list').toggle();
            $('.dropdownType').next('.down-list').hide();
        })

        $('.myself_active_navigation_all').on('click', function () {
            $(this).addClass('progress_select').siblings().removeClass('progress_select');
        })

        $scope.activityType = "";

        function price() {
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'home/getNowTime.do',
                data: $.param({}),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                var time = data.result;

                $http({
                    method: 'POST',
                    url: ApiEndpoint.url + 'activity/getMyActivityList.do',
                    data: $.param({
                        userId: localStorage.userId,
                        pageNum: 1,
                        pageSize: 10,
                        isAllStatus: 0,
                        statusPay: 12
                    }),
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                }).success(function (data) {
                    if (data.errorCode == 0) {
                        $scope.activeList = data.result;
                        console.log(data.result);

                        // newActivityStatus(活动状态):1即将开始(报名中)  2正在进行  3已结束
                        angular.forEach($scope.activeList, function (value) {
                            if (time < value.activityStartTime) {
                                // 即将开始
                                value.newActivityStatus = 1;
                            } else if (time >= value.activityStartTime && time <= value.activityEndTime) {
                                // 正在进行
                                value.newActivityStatus = 2;
                            } else if (time > value.activityEndTime) {
                                // 已结束
                                value.newActivityStatus = 3;
                            }
                        })
                    }
                })
            })
        }
        price();

        $scope.navIndex = 1;

        $scope.all = function () {
            // price();
            $scope.navIndex = 1;
            $('.down-list').hide();
        }

        $scope.clickPrice = function (id) {
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'activity/getMyActivityList.do',
                data: $.param({
                    userId: localStorage.userId,
                    pageNum: 1,
                    pageSize: 10,
                    isAllStatus: 1,
                    statusPay: id
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    $scope.activeList = data.result;
                }
            })
        }

    })


    //我的历史
    .controller('MyHistoryCtrl', function ($scope, $ionicHistory, $http, ApiEndpoint) {
        $('.tab-item1').on('click', function () {
            $('.tab-item1').removeClass('active1');
            $(this).addClass('active1');
            $('#history_content > div').css('display', 'none');
            switch ($(this).index()) {
                case 0: $('#progress').css('display', 'block'); break;
                case 1: $('#video').css('display', 'block'); break;
                case 2: $('#activity').css('display', 'block'); break;
            }
        })
        $scope.goBack = function () {
            $ionicHistory.goBack();
        }

        // type: 1视频  2课程 3活动
        $scope.getMyHistory = function (type) {
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'home/userHistoryRecord.do',
                data: $.param({
                    userId: localStorage.userId,
                    type: type
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    $scope.historyList = data.result;
                    console.log($scope.historyList);
                }
            })
        }
        // 默认显示课程
        $scope.getMyHistory(2);

    })


    //我的收藏
    .controller('MyCollectionCtrl', function ($scope, $ionicHistory, $http, ApiEndpoint) {
        $scope.goBack = function () {
            $ionicHistory.goBack();
        }

        $scope.typeId = 1;
        $scope.getMyCollection = function (type) {
            $scope.typeId = type;

            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'collect/getMyCollect.do',
                data: $.param({
                    userId: localStorage.userId,
                    type: type,
                    pageNum: 1,
                    pageSize: 10
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    $scope.collectList = data.result;
                }
            })
        }

        $scope.getMyCollection(1);
    })
    //账户设置
    .controller('MySettingCtrl', function ($scope, $ionicHistory, $ionicActionSheet, $state, $http, ApiEndpoint) {

        $scope.goBack = function () {

            $ionicHistory.goBack();
        }


        $scope.loginOut = function () {
            $ionicActionSheet.show({
                buttons: [
                    { text: '确定' },
                ],
                titleText: '确定退出登陆吗？',
                cancelText: '取消',
                buttonClicked: function (index) {
                    localStorage.clear();
                    $state.go('login');
                }
            });
        }

    })


    //消费记录
    .controller('MyConsumeRecordCtrl', function ($scope, $ionicHistory, $http, ApiEndpoint) {
        $scope.goBack = function () {
            $ionicHistory.goBack();
        }

        /*$http({
            method: 'POST',
            url: ApiEndpoint.url + 'record/getUserRecordList.do',
            data: $.param({
                userId: localStorage.userId,
                pageNum: 1,
                pageSize: 10
            }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function (data) {
            if (data.errorCode == 0) {
                $scope.recordList = data.result;
            }
        })*/

        // 消费记录查询
        $http({
            method: 'POST',
            url: ApiEndpoint.url + 'record/getUserConsumption.do',
            data: $.param({
                userId: localStorage.userId
            }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function (data) {
            if (data.errorCode == 0) {
                $scope.recordList = data.result;
            }
        })

    })


    //资料编辑
    .controller('MyEditProfileCtrl', function ($scope, $ionicLoading, $ionicActionSheet, $ionicHistory, $ionicPopup, $http, $timeout, ApiEndpoint, PopService) {
        $scope.goBack = function () {
            $ionicHistory.goBack();
        }

        $scope.showPop = function (text) {
            $ionicLoading.show({
                template: text
            });
            $timeout(function () {
                $ionicLoading.hide();
            }, 1500)
        };


        $http({
            method: 'POST',
            url: ApiEndpoint.url + 'user/getUserByUserId.do',
            data: $.param({
                userId: localStorage.userId
            }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function (data) {
            if (data.errorCode == 0) {
                $scope.user = data.result;
                console.log($scope.user);
            }
        })




        $scope.doUploadPhoto = function (element) {
            $scope.fileObj = element.files[0];
        }
        $scope.setImage = function () {
            // 自定义弹框
            var myPopup = $ionicPopup.show({
                template: '<input type="file" class="a_one" ng-model="jxssq.license" accept="image/*" onchange="angular.element(this).scope().doUploadPhoto(this)">',
                title: '上传你的图片',
                subTitle: '',
                scope: $scope,
                buttons: [
                    { text: '取消' },
                    {
                        text: '上传',
                        type: 'button-positive',
                        onTap: function (e) {
                            var addImageUrl = ApiEndpoint.url + "user/modifyUserIcon.do"; // 接收上传文件的后台地址
                            var form = new FormData();
                            form.append("userId", localStorage.userId);
                            form.append("file", $scope.fileObj);

                            var xhr = new XMLHttpRequest();

                            var response;
                            xhr.open("post", addImageUrl, true);

                            xhr.onload = function (el) {

                                response = JSON.parse(el.target.response);

                            };
                            xhr.send(form);
                            xhr.onreadystatechange = function () {
                                if (xhr.readyState == 4 && xhr.status == 200) {
                                    $scope.showPop('上传成功');
                                    $http.post(ApiEndpoint.url + "user/getUserByUserId.do", {}, {
                                        params: {
                                            userId: $scope.user.userId
                                        }
                                    }).success(function (data) {
                                        console.log(data);
                                        if (data.errorCode == 0) {
                                            localStorage.user = JSON.stringify(data.result);
                                            $scope.user = data.result;
                                        }
                                    })
                                }
                            }
                        }
                    },
                ]
            });
        }
        $scope.setnickName = function () {
            // 自定义弹窗
            var myPopup = $ionicPopup.show({
                template: '<input type="text" value="{{user.nickName}}" id="changenickName">',
                title: '修改昵称',
                subTitle: '',
                scope: $scope,
                buttons: [
                    { text: '<span>取消</span>' },
                    {
                        text: '<b>确定</b>',
                        onTap: function () {

                            $scope.user.nickName = $("#changenickName").val();

                        },
                    }
                ],
            });
        }

        $scope.setGender = function () {
            // 显示操作表
            $ionicActionSheet.show({
                buttons: [
                    { text: '男' },
                    { text: '女' },
                ],
                titleText: '',
                cancelText: '取消',
                buttonClicked: function (index) {
                    switch (index) {
                        case 0:
                            $scope.user.userSex = '男';
                            break;
                        case 1:
                            $scope.user.userSex = '女';
                            break;
                    }

                    $http.post(ApiEndpoint.url + "user/modifyUser.do", {}, {
                        params: {
                            sex: $scope.user.userSex,
                            userId: $scope.user.userId
                        }
                    }).success(function (data) {
                        if (data.errorCode == 0) {
                            $http.post(ApiEndpoint.url + "user/getUserByUserId.do", {}, {
                                params: {
                                    userId: $scope.user.userId
                                }
                            }).success(function (data) {
                                if (data.errorCode == 0) {
                                    localStorage.user = JSON.stringify(data.result);
                                }
                            })
                        } else {
                            $scope.showError();
                        }
                    })
                    return true;
                }
            });
        }

        // 修改公司
        $scope.setcompany = function () {
            // 自定义弹窗
            var myPopup = $ionicPopup.show({
                template: '<input type="text" value="{{user.userAddress}}" id="changecompany">',
                title: '修改公司',
                subTitle: '',
                scope: $scope,
                buttons: [
                    { text: '<span>取消</span>' },
                    {
                        text: '<b>确定</b>',
                        onTap: function () {

                            $scope.user.userAddress = $("#changecompany").val();

                        },

                    }
                ],
            });
        }

        // 修改邮箱
        $scope.setemail = function () {
            // 自定义弹窗
            var myPopup = $ionicPopup.show({
                template: '<input type="text" value="{{user.userEmail}}" id="changeemail">',
                title: '修改邮箱',
                subTitle: '',
                scope: $scope,
                buttons: [
                    { text: '<span>取消</span>' },
                    {
                        text: '<b>确定</b>',
                        onTap: function () {

                            $scope.user.userEmail = $("#changeemail").val();

                        },
                    }
                ],
            });
        }

        // 修改手机
        $scope.setmobile = function () {
            // 自定义弹窗
            var myPopup = $ionicPopup.show({
                template: '<input type="text" value="{{user.userPhone}}" id="changemobile">',
                title: '修改手机号',
                subTitle: '',
                scope: $scope,
                buttons: [
                    { text: '<span>取消</span>' },
                    {
                        text: '<b>确定</b>',
                        onTap: function () {
                            $scope.user.userPhone = $("#changemobile").val();
                        },
                    }
                ],
            });
        }


        // 保存
        $scope.keepinfo = function () {
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'user/modifyUser.do',
                data: $.param({
                    userId: localStorage.userId,
                    nickName: $scope.user.nickName,
                    mobile: $scope.user.userPhone,
                    sex: $scope.user.userSex,
                    address: $scope.user.userAddress,
                    email: $scope.user.userEmail
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    PopService.showPop('修改成功');
                } else {
                    PopService.showError('修改失败');
                }
            })
        }

    })


    //我的私信
    .controller('MyPrivateMessageCtrl', function ($scope, $ionicHistory, $http, ApiEndpoint) {
        $scope.goBack = function () {
            $ionicHistory.goBack();
        }

        $scope.noMorePage = false;
        $scope.pageNum = 1;

        function getMessage() {
            $http.post(ApiEndpoint.url + "message/getMessageList.do", {}, {
                params: {
                    userId: localStorage.userId,
                    fromUserId: 0,
                    toUserId: localStorage.userId,
                    type: 0,
                    pageNum: 1,
                    pageSize: 10
                }
            }).success(function (data) {
                $scope.$broadcast('scroll.refreshComplete');
                if (data.errorCode == 0) {
                    $scope.messageList = data.result;
                }
            })
        }
        getMessage()
        $scope.doRefresh = function () {
            getMessage();
            $scope.noMorePage = false;
            $scope.pageNum = 1;
        }
        $scope.loadMore = function () {
            $scope.pageNum++;
            $http.post(ApiEndpoint.url + "message/getMessageList.do", {}, {
                params: {
                    userId: localStorage.userId,
                    fromUserId: 0,
                    toUserId: localStorage.userId,
                    type: 0,
                    pageNum: $scope.pageNum,
                    pageSize: 10
                }
            }).success(function (data) {
                $scope.$broadcast('scroll.infiniteScrollComplete');
                if (data.errorCode == 0) {
                    for (var i = 0; i < data.result.length; i++) {
                        $scope.messageList.push(data.result[i]);
                    }
                    if (data.result.length < 10) {
                        $scope.noMorePage = true;
                    }
                } else {
                    $scope.noMorePage = true;
                }
            })
        }

    })

    .factory('PayType', function () {
        return {
            payType: {}
        }
    })
    //余额充值
    .controller('MyRechangeCtrl', function ($scope, $ionicHistory, $http, $ionicPopup, $state, PopService, ApiEndpoint, PayType) {
        $scope.goBack = function () {
            $ionicHistory.goBack();
        }

        // 充值额度
        $scope.orderAmount = 0;
        // 充值方式: 1支付宝  2微信
        $scope.selectPayType = function (type) {
            PayType.payType.type = type;
        }


        $http({
            method: 'POST',
            url: ApiEndpoint.url + 'product/getProductListForH5.do',
            data: $.param({}),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function (data) {
            if (data.errorCode == 0) {
                $scope.rechargeList = data.result;


                $scope.selectAmount = function (e, amount) {
                    $(e.target).addClass('rechange').siblings().removeClass('rechange');
                    $scope.orderAmount = amount;
                }
            }
        })

        $scope.openChargeModal = function () {
            if ($scope.orderAmount == 0) {
                PopService.showPop('请选择充值额度');
                return;
            }
            if (PayType.payType.type == undefined) {
                PopService.showPop('请选择支付方式');
                return;
            }

            console.log('充值额度: ', $scope.orderAmount);
            console.log('充值方式: ', PayType.payType.type);

            var confirmPopup = $ionicPopup.confirm({
                template: '<div style="text-align:center;height:50px;font-size:18px;">是否确认下单？</div>',
                cancelText: '取消',
                cancelType: '',
                okText: '确定',
                okType: ''
            });

            confirmPopup.then(function (res) {
                if (res) {
                    if (PayType.payType.type == 1) {
                        //支付宝充值
                        // 第一步:生成充值记录
                        $http({
                            method: 'POST',
                            url: ApiEndpoint.url + 'record/addRecord.do',
                            data: $.param({
                                userId: localStorage.userId,
                                recordMoney: $scope.orderAmount,
                                recordType: '支付宝',
                                rocordStatus: 1   // rocordStatus(是否已经支付): 1 未支付  2支付
                            }),
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                        }).success(function (data) {
                            if (data.errorCode == 0) {
                                console.log('生成充值记录成功');
                                var recordId = data.result;

                                // 第二步:获取orderId进行下单
                                $http({
                                    method: 'POST',
                                    url: ApiEndpoint.url + 'order/generateOrder.do',
                                    data: $.param({
                                        userId: localStorage.userId,
                                        recordId: recordId,
                                        orderTurnover: $scope.orderAmount,
                                        orderName: '支付宝下单',
                                        orderType: 5, // orderType:1入场券支付  2线下支付  3 余额支付  4微信支付  5支付宝支付
                                        payPath:1
                                    }),
                                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                                }).success(function (data) {
                                    if (data.errorCode == 0) {
                                        PopService.showPop('下单成功');

                                        var orderInfo = {};
                                        var orderInfo = data.result;

                                        console.log('orderId: ' + orderInfo.orderId);

                                        $state.go('alipay', {
                                            orderId: orderInfo.orderId,
                                            orderCode: orderInfo.orderCode,
                                            orderTurnover: orderInfo.orderTurnover,
                                            description: orderInfo.description
                                        });
                                    } else {
                                        PopService.showError('下单失败');
                                    }
                                })
                            } else {
                                console.log('生成充值记录失败');
                            }
                        })
                    } else if (PayType.payType.type == 2) {
                        //微信充值
                        /*$http({
                            method: 'POST',
                            url: ApiEndpoint.url + 'record/addRecord.do',
                            data: $.param({
                                userId: localStorage.userId,
                                recordMoney: 0.01,
                                recordType: '微信',
                                rocordStatus:1   // rocordStatus(是否已经支付): 1 未支付  2支付
                            }),
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                        }).success(function (data) {
                            if (data.errorCode == 0) {
                                console.log('生成充值记录成功');
                                var recordId = data.result;

                                // 第二步:获取orderId进行下单
                                $http({
                                    method: 'POST',
                                    url: ApiEndpoint.url + 'order/generateOrder.do',
                                    data: $.param({
                                        userId: localStorage.userId,
                                        recordId: recordId,
                                        orderTurnover: 0.01,
                                        orderName:'微信下单'
                                    }),
                                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                                }).success(function (data) {
                                    if (data.errorCode == 0) {
                                        PopService.showPop('下单成功');

                                        var orderInfo = {};
                                        var orderInfo = data.result;

                                        console.log('orderId: ' + orderInfo.orderId);

                                        $state.go('alipay',{
                                            orderId:orderInfo.orderId,
                                            orderCode:orderInfo.orderCode,
                                            orderTurnover:orderInfo.orderTurnover,
                                            description:orderInfo.description
                                        });
                                    }else{
                                        PopService.showError('下单失败');
                                    }
                                })
                            }else{
                                console.log('生成充值记录失败');
                            }
                        })*/



                    }
                } else {
                    console.log('取消下单');
                }
            });
        }

    })

    //确认订单--充值
    .controller('ConfirmPayCtrl', function ($scope, $http, $ionicHistory, $ionicModal) {
        $scope.goBack = function () {
            $ionicHistory.goBack();
        }


        $scope.pay1 = function () {
            $ionicModal.fromTemplateUrl('modal.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function (modal) {
                $scope.modal = modal;
                console.log($scope.modal);
                $scope.openModal();
            });
            $scope.openModal = function () {
                $scope.modal.show();
            };
            $scope.closeModal = function () {
                $scope.modal.hide();
            };
            //当我们用到模型时，清除它！
            $scope.$on('$destroy', function () {
                $scope.modal.remove();
            });
            // 当隐藏的模型时执行动作
            $scope.$on('modal.hide', function () {
                // 执行动作
            });
            // 当移动模型时执行动作
            $scope.$on('modal.removed', function () {
                // 执行动作
            });
        }

    })

    //支付宝充值
    .controller('AlipayCtrl', function ($scope, $http, $ionicHistory, $stateParams, ApiEndpoint) {
        $scope.goBack = function () {
            $ionicHistory.goBack();
        }

        $scope.orderInfo = {};
        $scope.orderInfo.orderId = $stateParams.orderId;
        $scope.orderInfo.orderCode = $stateParams.orderCode;
        $scope.orderInfo.orderTurnover = $stateParams.orderTurnover / 100;
        $scope.orderInfo.description = $stateParams.description;

        $scope.createOrder = function () {
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'order/alipayUtil.do',
                data: $.param({
                    orderId: $scope.orderInfo.orderId,
                    totalAmount: $scope.orderInfo.orderTurnover * 100
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    var str = data.result;
                    if (str != '') {
                        $('body').html(str);

                        // eval(str);

                        /*var div = document.createElement('div');
                        div.innerHTML = str;
                        document.body.appendChild(div);
                        document.forms.alipaysubmit.submit();*/
                    }
                }
            })
        }
    })

    //确认下单--课程(余额下单)
    .controller('CourseOrderCtrl', function ($scope, $http, $ionicHistory, $state, $stateParams, ApiEndpoint, PopService) {
        $scope.goBack = function () {
            $ionicHistory.goBack();
        }

        $scope.orderInfo = {};
        $scope.orderInfo.orderId = $stateParams.orderId;
        $scope.orderInfo.orderCode = $stateParams.orderCode;
        $scope.orderInfo.orderTurnover = $stateParams.orderTurnover / 100;
        $scope.orderInfo.description = $stateParams.description;


        $scope.createOrder = function () {
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'order/userBalancePay.do',
                data: $.param({
                    userId: localStorage.userId,
                    payType: 3,  //1入场券支付  2线下支付  3余额支付 4 微信支付  5支付宝支付
                    orderId: $scope.orderInfo.orderId,
                    totalPrice: $scope.orderInfo.orderTurnover * 100
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                console.log(data.result);
                if (data.errorCode == 0) {
                    PopService.showPop('支付成功');
                    $state.go('tabs.myself');
                }
            })
        }
    })


    //确认下单--微信支付二维码
    .controller('OrderWechatCtrl', function ($scope, $http, $ionicHistory, $state, $stateParams, ApiEndpoint, PopService) {
        $scope.goBack = function () {
            $ionicHistory.goBack();
        }

        $scope.orderInfo = {};
        $scope.orderInfo.orderId = $stateParams.orderId;
        $scope.orderInfo.orderCode = $stateParams.orderCode;
        $scope.orderInfo.orderTurnover = $stateParams.orderTurnover / 100;
        $scope.orderInfo.description = $stateParams.description;


        $http({
            method: 'POST',
            url: ApiEndpoint.url + 'wechat/getPrepareId.do',
            data: $.param({
                userId: localStorage.userId,
                // payType: 3,  //1入场券支付  2线下支付  3余额支付 4 微信支付  5支付宝支付
                orderId: $scope.orderInfo.orderId,
                totalPrice: $scope.orderInfo.orderTurnover * 100
            }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function (data) {
            console.log(data.result);
            if (data.errorCode == 0) {
                var qrcode = new QRCode(document.getElementById("qrcode"), {
                    width: 100,
                    height: 100
                });

                qrcode.makeCode(data.result.code_url);
            }
        })

    })


    //修改密码手机号验证界面
    .controller('MyModifyPasswordCtrl', function ($scope, $ionicHistory, $http, $timeout, $state, ApiEndpoint, PopService) {
        $scope.goBack = function () {
            $ionicHistory.goBack();
        }

        // 获取验证码
        $scope.getCode1 = true;
        $scope.timer = 60;
        $scope.timerCode = function () {
            $timeout.cancel($scope.timer1);
            if ($scope.timer == 0) {
                $scope.getCode1 = true;
                $scope.timer = 60;
            } else {
                $scope.timer--;
                $scope.timer1 = $timeout(function () {
                    $scope.timerCode();
                }, 1000)
            }
        }
        $scope.registerData = {};

        $scope.getCode = function () {
            if (!/^1[34578]\d{9}$/.test($scope.registerData.mobile)) {
                PopService.showPop('请输入正确的手机号');
                return;
            }

            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'user/genAuthCode.do',
                data: $.param({
                    mobile: $scope.registerData.mobile,
                    type: 2
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    PopService.showPop('获取验证码成功，请注意查收');
                    $scope.code = data.result;

                    $scope.getCode1 = false;
                    $timeout.cancel($scope.timer2);
                    $scope.timer2 = $timeout(function () {
                        $scope.timerCode();
                    }, 1000);
                }
            })
        }
        $scope.submit = function () {
            if ($scope.code == undefined) {
                PopService.showPop("请先获取验证码");
            } else if ($scope.code != $scope.registerData.authcode) {
                PopService.showPop("验证码错误");
            } else {
                $state.go('edit_password');
            }
        }

    })
    //修改密码
    .controller('MyEditPasswordCtrl', function ($scope, $ionicHistory, $http, $state, ApiEndpoint, PopService) {
        $scope.registerData = { password: '', rpassword: '' }
        $scope.keepinfo = function () {
            if (!$scope.registerData.password) {
                PopService.showPop("新密码不能为空");
            } else if (!$scope.registerData.rpassword) {
                PopService.showPop("确认密码不能为空");
            } else if ($scope.registerData.password.length < 6) {
                PopService.showPop("密码的位数不能小于6位");
            } else if ($scope.registerData.rpassword != $scope.registerData.password) {
                PopService.showPop("两次输入的密码不相同");
            } else {
                $http.post(ApiEndpoint.url + "user/modifyPassword.do", {}, {
                    params: {
                        newPwd: $scope.registerData.password,
                        confirmPwd: $scope.registerData.rpassword,
                        userId: localstorage.userId
                    }
                }).success(function (data) {
                    if (data.errorCode == 0) {
                        PopService.showPop("修改成功");
                        $state.go('tabs.myself');
                    } else {
                        $scope.showError();
                    }
                })
            }
        }

        $scope.goBack = function () {
            $ionicHistory.goBack();
        }


    })
    // 用户反馈
    .controller('UserFeedbackCtrl', function ($scope, $ionicHistory, $http, ApiEndpoint, PopService) {
        $scope.goBack = function () {
            $ionicHistory.goBack();
        }

        $scope.type_id = 1;
        $scope.progressType = function (type) {
            $scope.type_id = type;
        }


        $scope.registerData = {};
        $scope.length = 200;

        //显示变更数量
        $scope.textChange = function () {
            $scope.length = 200 - $scope.registerData.message.length;
        }

        $scope.keepinfo = function () {
            console.log(/^1[34578]\d{9}$/.test($scope.registerData.userContact));
            console.log(/^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/.test($scope.registerData.userContact));
            console.log(/^1[34578]\d{9}$/.test($scope.registerData.userContact) && /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/.test($scope.registerData.userContact));
            if ($scope.registerData.message == undefined || $scope.registerData.message == '') {
                PopService.showPop('反馈内容不能为空');
                return;
            } else if (!/^1[34578]\d{9}$/.test($scope.registerData.userContact) && !/^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/.test($scope.registerData.userContact)) {
                PopService.showPop('手机或邮箱地址有误');
                return;
            }


            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'feedback/addFeedback.do',
                data: $.param({
                    userId: localStorage.userId,
                    feedBackType: $scope.type_id,
                    feedBackContent: $scope.registerData.message,
                    userContact: $scope.registerData.userContact
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    PopService.showPop('提交成功');
                } else {
                    PopService.showError('提交失败');
                }
            })

        }
    })


    // 账户绑定
    .controller('AccountBindCtrl', function ($scope, $ionicHistory, $http, $timeout, ApiEndpoint, PopService) {
        $scope.goBack = function () {
            $ionicHistory.goBack();
        }

        // 获取验证码
        $scope.getCode1 = true;
        $scope.timer = 60;
        $scope.timerCode = function () {
            $timeout.cancel($scope.timer1);
            if ($scope.timer == 0) {
                $scope.getCode1 = true;
                $scope.timer = 60;
            } else {
                $scope.timer--;
                $scope.timer1 = $timeout(function () {
                    $scope.timerCode();
                }, 1000)
            }
        }
        $scope.registerData = {};

        $scope.getCode = function () {
            if (!/^1[34578]\d{9}$/.test($scope.registerData.mobile)) {
                PopService.showPop('请输入正确的手机号');
                return;
            }

            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'user/genAuthCode.do',
                data: $.param({
                    mobile: $scope.registerData.mobile,
                    type: 2
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    PopService.showPop('获取验证码成功，请注意查收');
                    $scope.code = data.result;

                    $scope.getCode1 = false;
                    $timeout.cancel($scope.timer2);
                    $scope.timer2 = $timeout(function () {
                        $scope.timerCode();
                    }, 1000);
                }
            })
        }
        $scope.submit = function () {
            if ($scope.code == undefined) {
                PopService.showPop("请先获取验证码");
            } else if ($scope.code != $scope.registerData.authcode) {
                PopService.showPop("验证码错误");
            } else {
                $http({
                    method: 'POST',
                    url: ApiEndpoint.url + 'user/userBindPhone.do',
                    data: $.param({
                        userId: localStorage.userId,
                        phone: $scope.registerData.mobile
                    }),
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                }).success(function (data) {
                    if (data.errorCode == 0) {
                        PopService.showPop('绑定手机成功');
                    } else {
                        PopService.showPop('绑定手机失败');
                    }
                })
            }

        }

    })


    //我的优惠券
    .controller('MyCouponCtrl', function ($scope, $ionicHistory, $ionicPopup, $http, ApiEndpoint) {
        $http({
            method: 'POST',
            url: ApiEndpoint.url + 'coupon/getUserCouponList.do',
            data: $.param({
                userId: localStorage.userId
            }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function (data) {
            if (data.errorCode == 0) {
                $scope.couponList = data.result;
            }
        })

        $scope.showPopup = function () {
            $scope.data = {}

            // 自定义弹窗
            var myPopup = $ionicPopup.show({
                template: '<input type="text" ng-model="data.couponCode" placeholder="请输入兑换码">',
                title: '兑换优惠券',
                subTitle: '',
                scope: $scope,
                buttons: [
                    { text: '<span>取消</span>' },
                    {
                        text: '<sapn ng-click="">确定</span>',

                        onTap: function (e) {
                            if (!$scope.data.couponCode) {
                                // 不允许用户关闭，除非输入 wifi 密码
                                e.preventDefault();
                            } else {
                                return $scope.data.couponCode;
                            }
                        }
                    },
                ]
            });
        };

        $scope.goBack = function () {
            $ionicHistory.goBack();
        }
    })


    //即将直播详情
    .controller('UpcomingLivingDetailsCtrl', function ($scope, $ionicHistory, $http, $state, $stateParams,ApiEndpoint) {
        $scope.goBack = function () {
            $ionicHistory.goBack();
        }

        $('.tab_change_selected').on('click', function () {
            $('.tab_change_selected').removeClass('active1');
            $(this).addClass('active1');
            $('#content > div').css('display', 'none');
            switch ($(this).index()) {
                case 0: $('#detail').css('display', 'block'); break;//详情
                case 1: $('#lector').css('display', 'block'); break;//讲师
                case 2: $('#related').css('display', 'block'); break;//相关
            }
        })

        var liveId = $stateParams.liveId;
        console.log(liveId);

        $http({
            method: 'POST',
            url: ApiEndpoint.url + 'live/getLiveDeatilById.do',
            data: $.param({
                liveId:liveId
            }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function(data){
            if(data.errorCode == 0){
                console.log(data.result);
                $scope.upcomingLivingInfo = data.result;
            }
        })
    })


    //活动详情
    .controller('ActiveDetailsCtrl', function ($scope, $ionicHistory, $http, ApiEndpoint, $stateParams) {
        $scope.goBack = function () {
            $ionicHistory.goBack();
        }

        if (localStorage.userId == undefined) {
            $state.go('login');
            return;
        }

        $scope.activityId = $stateParams.activityId;



        // 即将直播报名状态beforeLivingEnrollStatus：false未报名  true已报名
        $scope.beforeLivingEnrollStatus = false;
        // 即将直播支付状态beforeLivingPayStatus：false未支付  true已支付
        $scope.beforeLivingPayStatus = false;

        // 正在直播报名状态livingEnrollStatus：false未报名  true已报名
        $scope.livingEnrollStatus = false;
        // 正在直播支付状态livingPayStatus：false未支付  true已支付
        $scope.livingPayStatus = false;

        /*// 直播已结束支付状态afterLivingPayStatus：false未支付  true已支付
        $scope.afterLivingPayStatus = false;*/


        $http({
            method: 'POST',
            url: ApiEndpoint.url + 'home/getNowTime.do',
            data: $.param({}),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function (data) {
            if (data.errorCode == 0) {
                var time = data.result;

                $http({
                    method: 'POST',
                    url: ApiEndpoint.url + 'activity/getActivityById.do',
                    data: $.param({
                        userId: localStorage.userId,
                        activityId: $scope.activityId,
                        enrollType: 2    //1直播报名  2活动报名
                    }),
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                }).success(function (data) {
                    if (data.errorCode == 0) {
                        $scope.activityInfo = data.result.activity;
                        console.log($scope.activityInfo);
                        //enrollStatus(报名状态):0未报名  1已报名
                        $scope.activityEnroll = data.result.enrollStatus;


                        var activityDescription = data.result.activity.activityDescription;
                        $('#detail').html(activityDescription);


                        // activityType(活动类型): 1内  2审  3财  4税  5风
                        // 活动--相关(根据activityType获取活动的相关活动列表)
                        $http({
                            method: 'POST',
                            url: ApiEndpoint.url + 'activity/getAllActivityList.do',
                            data: $.param({
                                activityType: $scope.activityInfo.activityType
                            }),
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                        }).success(function (data) {
                            if (data.errorCode == 0) {
                                var activityRelatedResult = data.result;

                                $scope.activityRelatedList = [];

                                // 相关列表去除本身
                                if (activityRelatedResult.length > 0) {
                                    angular.forEach(activityRelatedResult, function (value) {
                                        if ($scope.activityId != value.activityId) {
                                            $scope.activityRelatedList.push(value);
                                        }
                                    })
                                }
                            }
                        })



                        // newActivityStatus用于判断活动状态
                        if (time < $scope.activityInfo.activityStartTime) {
                            // 即将开始
                            $scope.activityInfo.newActivityStatus = 1;
                        } else if (time >= $scope.activityInfo.activityStartTime && time <= $scope.activityInfo.activityEndTime) {
                            // 直播中
                            $scope.activityInfo.newActivityStatus = 2;
                        } else if (time > $scope.activityInfo.activityEndTime) {
                            // 已结束
                            $scope.activityInfo.newActivityStatus = 3;
                        }



                        //切换选项
                        $scope.index = 0;
                        if($scope.activityInfo.newActivityStatus == 1 || $scope.activityInfo.newActivityStatus == 2){
                            $scope.index = 1;
                        }else if($scope.activityInfo.newActivityStatus == 3){
                            $scope.index = 2;
                        }
                        $scope.setIndex = function(index){
                            $scope.index = index;
                        }




                        $http({
                            method: 'POST',
                            url: ApiEndpoint.url + 'order/getOrderByActivityAndUserId.do',
                            data: $.param({
                                userId: localStorage.userId,
                                activityId: $scope.activityId
                            }),
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                        }).success(function (data) {
                            if (data.errorCode == 0) {
                                // total=1表示已支付 total=2表示未支付
                                var activityPayStatus = data.total;


                                // 即将直播 未报名
                                if($scope.activityInfo.newActivityStatus == 1 && $scope.activityEnroll == 0){
                                    $scope.beforeLivingEnrollStatus = false;
                                }
                                // 即将直播 已报名但未支付
                                else if($scope.activityInfo.newActivityStatus == 1 && $scope.activityEnroll == 1 && activityPayStatus == 2){
                                    $scope.beforeLivingEnrollStatus = true;
                                    $scope.beforeLivingPayStatus = false;
                                }
                                // 即将直播 已报名且已支付
                                else if($scope.activityInfo.newActivityStatus == 1 && $scope.activityEnroll == 1 && activityPayStatus == 1){
                                    $scope.beforeLivingEnrollStatus = true;
                                    $scope.beforeLivingPayStatus = true;
                                }


                                // 正在直播 未报名
                                if($scope.activityInfo.newActivityStatus == 2 && $scope.activityEnroll == 0){
                                    $scope.livingEnrollStatus = false;
                                }
                                // 正在直播 已报名但未支付
                                else if($scope.activityInfo.newActivityStatus == 2 && $scope.activityEnroll == 1 && activityPayStatus == 2){
                                    $scope.livingEnrollStatus = true;
                                    $scope.livingPayStatus = false;
                                }
                                // 正在直播 已报名且已支付
                                else if($scope.activityInfo.newActivityStatus == 2 && $scope.activityEnroll == 1 && activityPayStatus == 1){
                                    $scope.livingEnrollStatus = true;
                                    $scope.livingPayStatus = true;
                                }


                                /*// 直播已结束 未支付
                                if($scope.activityInfo.newActivityStatus == 3 && activityPayStatus == 2){
                                    $scope.afterLivingPayStatus = false;
                                }
                                // 直播已结束 已支付
                                else if($scope.activityInfo.newActivityStatus == 3 && activityPayStatus == 1){
                                    $scope.afterLivingPayStatus = true;
                                }*/

                            }
                        })
                    }
                })
            }
        })


        // 活动--讲师
        $http({
            method: 'POST',
            url: ApiEndpoint.url + 'teacher/getTeacherByActivityId.do',
            data: $.param({
                activityId: $scope.activityId
            }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function (data) {
            if (data.errorCode == 0) {
                $scope.activityTeacherInfo = data.result;
            }
        })

        
        

    })

    //线上沙龙详情
    .controller('SalonCtrl', function ($scope, $ionicHistory, $http, ApiEndpoint, $stateParams) {
        $scope.goBack = function () {
            $ionicHistory.goBack();
        }

        if (localStorage.userId == undefined) {
            $state.go('login');
            return;
        }

        $scope.activityId = $stateParams.activityId;
        $scope.liveId = $stateParams.liveId;
        console.log($scope.activityId,$scope.liveId);


        $('.tab_change_selected').on('click', function () {
            $('.tab_change_selected').removeClass('active1');
            $(this).addClass('active1');
            $('#content > div').css('display', 'none');
            switch ($(this).index()) {
                case 0: $('#detail').css('display', 'block'); break;//详情
                case 1: $('#lector').css('display', 'block'); break;//讲师
                case 2: $('#related').css('display', 'block'); break;//相关
            }
        })



        // 即将直播报名状态beforeLivingEnrollStatus：false未报名  true已报名
        $scope.beforeLivingEnrollStatus = false;
        // 即将直播支付状态beforeLivingPayStatus：false未支付  true已支付
        $scope.beforeLivingPayStatus = false;
        // 正在直播报名状态livingEnrollStatus：false未报名  true已报名
        $scope.livingEnrollStatus = false;
        // 正在直播支付状态livingPayStatus：false未支付  true已支付
        $scope.livingPayStatus = false;




        $http({
            method: 'POST',
            url: ApiEndpoint.url + 'home/getNowTime.do',
            data: $.param({}),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function (data) {
            if (data.errorCode == 0) {
                var time = data.result;

                $http({
                    method: 'POST',
                    url: ApiEndpoint.url + 'activity/getActivityById.do',
                    data: $.param({
                        userId: localStorage.userId,
                        activityId: $scope.activityId,
                        enrollType: 2    //1直播报名  2活动报名
                    }),
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                }).success(function (data) {
                    if (data.errorCode == 0) {
                        $scope.activityInfo = data.result.activity;

                        //enrollStatus(报名状态):0未报名  1已报名
                        $scope.activityEnroll = data.result.enrollStatus;


                        var activityDescription = data.result.activity.activityDescription;
                        $('#detail').html(activityDescription);


                        // activityType(活动类型): 1内  2审  3财  4税  5风
                        // 活动--相关(根据activityType获取活动的相关活动列表)
                        $http({
                            method: 'POST',
                            url: ApiEndpoint.url + 'activity/getAllActivityList.do',
                            data: $.param({
                                activityType: $scope.activityInfo.activityType
                            }),
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                        }).success(function (data) {
                            if (data.errorCode == 0) {
                                var activityRelatedResult = data.result;

                                $scope.activityRelatedList = [];

                                // 相关列表去除本身
                                if (activityRelatedResult.length > 0) {
                                    angular.forEach(activityRelatedResult, function (value) {
                                        if ($scope.activityId != value.activityId) {
                                            $scope.activityRelatedList.push(value);
                                        }
                                    })
                                }
                            }
                        })



                        // newActivityStatus用于判断活动状态
                        if (time < $scope.activityInfo.activityStartTime) {
                            // 即将开始
                            $scope.activityInfo.newActivityStatus = 1;
                        } else if (time >= $scope.activityInfo.activityStartTime && time <= $scope.activityInfo.activityEndTime) {
                            // 直播中
                            $scope.activityInfo.newActivityStatus = 2;
                        } else if (time > $scope.activityInfo.activityEndTime) {
                            // 已结束
                            $scope.activityInfo.newActivityStatus = 3;
                        }



                        $http({
                            method: 'POST',
                            url: ApiEndpoint.url + 'order/getOrderByActivityAndUserId.do',
                            data: $.param({
                                userId: localStorage.userId,
                                activityId: $scope.activityId
                            }),
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                        }).success(function (data) {
                            if (data.errorCode == 0) {
                                // total=1表示已支付 total=2表示未支付
                                var activityPayStatus = data.total;


                                // 即将直播 未报名
                                if($scope.activityInfo.newActivityStatus == 1 && $scope.activityEnroll == 0){
                                    $scope.beforeLivingEnrollStatus = false;
                                }
                                // 即将直播 已报名但未支付
                                else if($scope.activityInfo.newActivityStatus == 1 && $scope.activityEnroll == 1 && activityPayStatus == 2){
                                    $scope.beforeLivingEnrollStatus = true;
                                    $scope.beforeLivingPayStatus = false;
                                }
                                // 即将直播 已报名且已支付
                                else if($scope.activityInfo.newActivityStatus == 1 && $scope.activityEnroll == 1 && activityPayStatus == 1){
                                    $scope.beforeLivingEnrollStatus = true;
                                    $scope.beforeLivingPayStatus = true;
                                }


                                // 正在直播 未报名
                                if($scope.activityInfo.newActivityStatus == 2 && $scope.activityEnroll == 0){
                                    $scope.livingEnrollStatus = false;
                                }
                                // 正在直播 已报名但未支付
                                else if($scope.activityInfo.newActivityStatus == 2 && $scope.activityEnroll == 1 && activityPayStatus == 2){
                                    $scope.livingEnrollStatus = true;
                                    $scope.livingPayStatus = false;
                                }
                                // 正在直播 已报名且已支付
                                else if($scope.activityInfo.newActivityStatus == 2 && $scope.activityEnroll == 1 && activityPayStatus == 1){
                                    $scope.livingEnrollStatus = true;
                                    $scope.livingPayStatus = true;
                                }

                            }
                        })
                    }
                })
            }
        })


        // 活动--讲师
        $scope.getActivityTeacher = function () {
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'teacher/getTeacherByActivityId.do',
                data: $.param({
                    activityId: $scope.activityId
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    $scope.activityTeacherInfo = data.result;
                }
            })
        }

    })


    //即将直播报名 和 正在直播报名
    .controller('LiveApplyCtrl', function ($scope, $http, $ionicHistory, $state, $stateParams, ApiEndpoint, PopService) {
        $scope.goBack = function () {
            $ionicHistory.goBack();
        }

        var liveId = $stateParams.liveId;
        console.log(liveId);

        $scope.applyInfo = {};

        $scope.submitInfo = function () {
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'enroll/addEnroll.do',
                data: $.param({
                    userId: localStorage.userId,
                    enrollName:$scope.applyInfo.enrollName,
                    mobile: $scope.applyInfo.contactWay,
                    company: $scope.applyInfo.companyName,
                    objectId: liveId,
                    enrollType: 1  //enrollType:1直播报名  2活动报名
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    console.log(data.result);

                    PopService.showPop('报名成功');
                    $state.go('confirm_order_live', {
                        liveId: liveId
                    });
                }
            })

        }

    })


    //活动报名
    .controller('ActiveApplyCtrl', function ($scope, $http, $state,$stateParams,$ionicHistory,ApiEndpoint,PopService) {
        $scope.goBack = function () {
            $ionicHistory.goBack();
        }

        var activityId = $stateParams.activityId;
        console.log(activityId);

        $scope.applyInfo = {};

        $scope.submitInfo = function () {
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'enroll/addEnroll.do',
                data: $.param({
                    userId: localStorage.userId,
                    enrollName:$scope.applyInfo.enrollName,
                    mobile: $scope.applyInfo.contactWay,
                    company: $scope.applyInfo.companyName,
                    objectId: activityId,
                    enrollType: 2  //enrollType:1直播报名  2活动报名
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    console.log(data.result);

                    PopService.showPop('报名成功');
                    $state.go('confirm_order_activity', {
                        activityId: activityId
                    });
                }
            })

        }
    })


    //确认订单--活动(即将开始和正在进行)
    .controller('ConfirmOrderActivityCtrl',function($scope, $ionicPopover, $http, $timeout, $ionicHistory, $ionicModal, $state, $stateParams, ApiEndpoint, PopService){
        $scope.goBack = function () {
            $ionicHistory.goBack();
        }

        var activityId = $stateParams.activityId;

        // 获取报名信息
        $http({
            method: 'POST',
            url: ApiEndpoint.url + 'enroll/sureEnroll.do',
            data: $.param({
                userId: localStorage.userId,
                ObjectId: activityId,
                enrollType: 2  //enrollType:1直播报名  2活动报名
            }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function (data) {
            if (data.errorCode == 0) {
                $scope.activityInfo = data.result;
                console.log($scope.activityInfo);
            }
        })

        // 获取活动信息
        $http({
            method: 'POST',
            url: ApiEndpoint.url + 'activity/getActivityById.do',
            data: $.param({
                userId: localStorage.userId,
                activityId: activityId,
                enrollType: 2    //1直播报名  2活动报名
            }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function(data){
            if(data.errorCode == 0){
                $scope.activityName = data.result.activity.activityName;
                $scope.activityPrice = data.result.activity.activityPrice;
            }
        })




        $scope.pay = function () {
            $ionicModal.fromTemplateUrl('modal.html', {
                scope: $scope,
                animation: 'slide-in-up',
                // backdropClickToClose:true
            }).then(function (modal) {
                $scope.modal = modal;
                $scope.openModal();
            });


            $scope.openModal = function () {
                $scope.modal.show();
            };
            $scope.closeModal = function () {
                $scope.modal.hide();
            };
            //当我们用到模型时，清除它！
            $scope.$on('$destroy', function () {
                $scope.modal.remove();
            });
            // 当隐藏的模型时执行动作
            $scope.$on('modal.hide', function () {
                // 执行动作
            });
            // 当移动模型时执行动作
            $scope.$on('modal.removed', function () {
                // 执行动作
            });


            /*var htmlEl = angular.element(document.querySelector('html'));
            htmlEl.on('click', function (event) {
                console.log(event.target.nodeName);
                if (event.target.nodeName === 'HTML') {
                    alert(1);
                    if ($scope.modal.isShown()) {
                        $scope.closeModal();
                    }
                }
            });*/

        }


        //支付宝支付
        $scope.aliPay = function () {
            // 获取orderId进行下单
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'order/generateOrder.do',
                data: $.param({
                    userId: localStorage.userId,
                    activityId: activityId,
                    orderTurnover: $scope.activityPrice,
                    orderName: '支付宝下单',
                    orderType: 5, // orderType:1入场券支付  2线下支付  3 余额支付  4微信支付  5支付宝支付
                    payPath:1
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    PopService.showPop('下单成功');

                    var orderInfo = {};
                    var orderInfo = data.result;

                    console.log('orderId: ' + orderInfo.orderId);

                    $state.go('alipay', {
                        orderId: orderInfo.orderId,
                        orderCode: orderInfo.orderCode,
                        orderTurnover: orderInfo.orderTurnover,
                        description: orderInfo.description
                    });
                } else {
                    PopService.showError('下单失败');
                }
            })
        }


        //微信支付
        $scope.wechatPay = function () {
            // 获取orderId进行下单
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'order/generateOrder.do',
                data: $.param({
                    userId: localStorage.userId,
                    activityId: activityId,
                    orderTurnover: $scope.activityPrice,
                    orderName: '微信下单',
                    orderType: 4, // orderType:1入场券支付  2线下支付  3 余额支付  4微信支付  5支付宝支付
                    payPath:1
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    var orderInfo = {};
                    var orderInfo = data.result;

                    console.log('orderId: ' + orderInfo.orderId);

                    $state.go('order_wechat', {
                        orderId: orderInfo.orderId,
                        orderCode: orderInfo.orderCode,
                        orderTurnover: orderInfo.orderTurnover,
                        description: orderInfo.description
                    });
                }
            })

        }


        //余额支付
        $scope.go = function () {
            // 获取orderId进行下单
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'order/generateOrder.do',
                data: $.param({
                    userId: localStorage.userId,
                    activityId: activityId,
                    orderTurnover: $scope.activityPrice,
                    orderName: '风控币下单',
                    orderType: 3, // orderType:1入场券支付  2线下支付  3 余额支付  4微信支付  5支付宝支付
                    payPath:1
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    PopService.showPop('下单成功');

                    var orderInfo = {};
                    var orderInfo = data.result;

                    console.log('orderId: ' + orderInfo.orderId);

                    $state.go('course_order', {
                        orderId: orderInfo.orderId,
                        orderCode: orderInfo.orderCode,
                        orderTurnover: orderInfo.orderTurnover,
                        description: orderInfo.description
                    });
                } else {
                    PopService.showError('下单失败');
                }
            })
        }


        //体验券支付
        $scope.payCoupon = function () {
            // 获取orderId进行下单
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'order/generateOrder.do',
                data: $.param({
                    userId: localStorage.userId,
                    activityId: activityId,
                    orderTurnover: $scope.activityPrice,
                    orderName: '体验券下单',
                    orderType: 1, // orderType:1体验券支付  2线下支付  3 余额支付  4微信支付  5支付宝支付
                    payPath:1
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    var orderInfo = {};
                    var orderInfo = data.result;

                    console.log('orderId: ' + orderInfo.orderId);

                    $state.go('change_coupon', {
                        orderId: orderInfo.orderId
                    });
                }
            })
        }

    })
    //确认订单--活动(已结束)
    .controller('ConfirmOrderActivityEndCtrl', ['$scope', '$ionicPopover', '$http', '$timeout', '$ionicHistory', '$ionicModal', '$state', '$stateParams', 'ApiEndpoint', 'PopService', function ($scope, $ionicPopover, $http, $timeout, $ionicHistory, $ionicModal, $state, $stateParams, ApiEndpoint, PopService) {
        $scope.goBack = function () {
            $ionicHistory.goBack();
        }

        var activityId = $stateParams.activityId;

        // 获取活动信息
        $http({
            method: 'POST',
            url: ApiEndpoint.url + 'activity/getActivityById.do',
            data: $.param({
                userId: localStorage.userId,
                activityId: activityId,
                enrollType: 2    //1直播报名  2活动报名
            }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function(data){
            if(data.errorCode == 0){
                $scope.activityName = data.result.activity.activityName;
                $scope.activityPrice = data.result.activity.activityPrice;
            }
        })


        $scope.pay = function () {
            $ionicModal.fromTemplateUrl('modal.html', {
                scope: $scope,
                animation: 'slide-in-up',
                // backdropClickToClose:true
            }).then(function (modal) {
                $scope.modal = modal;
                $scope.openModal();
            });


            $scope.openModal = function () {
                $scope.modal.show();
            };
            $scope.closeModal = function () {
                $scope.modal.hide();
            };
            //当我们用到模型时，清除它！
            $scope.$on('$destroy', function () {
                $scope.modal.remove();
            });
            // 当隐藏的模型时执行动作
            $scope.$on('modal.hide', function () {
                // 执行动作
            });
            // 当移动模型时执行动作
            $scope.$on('modal.removed', function () {
                // 执行动作
            });
        }


        //支付宝支付
        $scope.aliPay = function () {
            // 获取orderId进行下单
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'order/generateOrder.do',
                data: $.param({
                    userId: localStorage.userId,
                    activityId: activityId,
                    orderTurnover: $scope.activityPrice,
                    orderName: '支付宝下单',
                    orderType: 5, // orderType:1入场券支付  2线下支付  3 余额支付  4微信支付  5支付宝支付
                    payPath:1
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    PopService.showPop('下单成功');

                    var orderInfo = {};
                    var orderInfo = data.result;

                    console.log('orderId: ' + orderInfo.orderId);

                    $state.go('alipay', {
                        orderId: orderInfo.orderId,
                        orderCode: orderInfo.orderCode,
                        orderTurnover: orderInfo.orderTurnover,
                        description: orderInfo.description
                    });
                } else {
                    PopService.showError('下单失败');
                }
            })
        }


        //微信支付
        $scope.wechatPay = function () {
            // 获取orderId进行下单
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'order/generateOrder.do',
                data: $.param({
                    userId: localStorage.userId,
                    activityId: activityId,
                    orderTurnover: $scope.activityPrice,
                    orderName: '微信下单',
                    orderType: 4, // orderType:1入场券支付  2线下支付  3 余额支付  4微信支付  5支付宝支付
                    payPath:1
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    var orderInfo = {};
                    var orderInfo = data.result;

                    console.log('orderId: ' + orderInfo.orderId);

                    $state.go('order_wechat', {
                        orderId: orderInfo.orderId,
                        orderCode: orderInfo.orderCode,
                        orderTurnover: orderInfo.orderTurnover,
                        description: orderInfo.description
                    });
                }
            })
        }

        //余额支付
        $scope.go = function () {
            // 获取orderId进行下单
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'order/generateOrder.do',
                data: $.param({
                    userId: localStorage.userId,
                    activityId: activityId,
                    orderTurnover: $scope.activityPrice,
                    orderName: '风控币下单',
                    orderType: 3, // orderType:1入场券支付  2线下支付  3 余额支付  4微信支付  5支付宝支付
                    payPath:1
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    PopService.showPop('下单成功');

                    var orderInfo = {};
                    var orderInfo = data.result;

                    console.log('orderId: ' + orderInfo.orderId);

                    $state.go('course_order', {
                        orderId: orderInfo.orderId,
                        orderCode: orderInfo.orderCode,
                        orderTurnover: orderInfo.orderTurnover,
                        description: orderInfo.description
                    });
                } else {
                    PopService.showError('下单失败');
                }
            })
        }

        //体验券支付
        $scope.payCoupon = function () {
            // 获取orderId进行下单
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'order/generateOrder.do',
                data: $.param({
                    userId: localStorage.userId,
                    activityId: activityId,
                    orderTurnover: $scope.activityPrice,
                    orderName: '体验券下单',
                    orderType: 1, // orderType:1体验券支付  2线下支付  3 余额支付  4微信支付  5支付宝支付
                    payPath:1
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    var orderInfo = {};
                    var orderInfo = data.result;

                    console.log('orderId: ' + orderInfo.orderId);

                    $state.go('change_coupon', {
                        orderId: orderInfo.orderId
                    });
                }
            })
        }

    }])



    //确认订单--课程(预支付)
    .controller('ConfirmOrderCourseCtrl', function ($scope, $ionicPopover, $http, $timeout, $ionicHistory, $ionicModal, $state, $stateParams, ApiEndpoint, PopService) {
        $scope.goBack = function () {
            $ionicHistory.goBack();
        }

        var courseId = $stateParams.courseId;


        //获取课程信息
        $http({
            method: 'POST',
            url: ApiEndpoint.url + 'course/getCourseById.do',
            data: $.param({
                userId: localStorage.userId,
                courseId: courseId,
                // type(点赞类型):1直播 2视频 3课程
                type: 3,
                //collectType(收藏类型):1课程 2视频
                collectType: 1
            }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function (data) {
            if (data.errorCode == 0) {
                $scope.courseName = data.result.course.courseName;
                $scope.coursePrice = data.result.course.price;
            }
        })


        $scope.pay = function () {
            $ionicModal.fromTemplateUrl('modal.html', {
                scope: $scope,
                animation: 'slide-in-up',
                // backdropClickToClose:true
            }).then(function (modal) {
                $scope.modal = modal;
                $scope.openModal();
            });


            $scope.openModal = function () {
                $scope.modal.show();
            };
            $scope.closeModal = function () {
                $scope.modal.hide();
            };
            //当我们用到模型时，清除它！
            $scope.$on('$destroy', function () {
                $scope.modal.remove();
            });
            // 当隐藏的模型时执行动作
            $scope.$on('modal.hide', function () {
                // 执行动作
            });
            // 当移动模型时执行动作
            $scope.$on('modal.removed', function () {
                // 执行动作
            });


            /*var htmlEl = angular.element(document.querySelector('html'));
            htmlEl.on('click', function (event) {
                console.log(event.target.nodeName);
                if (event.target.nodeName === 'HTML') {
                    alert(1);
                    if ($scope.modal.isShown()) {
                        $scope.closeModal();
                    }
                }
            });*/

        }


        //支付宝支付
        $scope.aliPay = function () {
            // 获取orderId进行下单
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'order/generateOrder.do',
                data: $.param({
                    userId: localStorage.userId,
                    courseId: courseId,
                    orderTurnover: $scope.coursePrice,
                    orderName: '支付宝下单',
                    orderType: 5, // orderType:1入场券支付  2线下支付  3 余额支付  4微信支付  5支付宝支付
                    payPath:1
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    PopService.showPop('下单成功');

                    var orderInfo = {};
                    var orderInfo = data.result;

                    console.log('orderId: ' + orderInfo.orderId);

                    $state.go('alipay', {
                        orderId: orderInfo.orderId,
                        orderCode: orderInfo.orderCode,
                        orderTurnover: orderInfo.orderTurnover,
                        description: orderInfo.description
                    });
                } else {
                    PopService.showError('下单失败');
                }
            })
        }


        //微信支付
        $scope.wechatPay = function () {
            /*var clicktag = 0;
            if (clicktag == 0) {
                clicktag = 1;

                $.ajax({
                    type: 'GET',
                    url: 'http://www.igmhz.com/fengkong-server/wechat/getPrepareId.do',
                    data: { openID: 'oPjcrs-c2-k1rUS8Qd6bQOQZvTZE', orderId: $scope.orderId },
                    success: function (data) {
                        if (data.errorCode == 0) {
                            var jsonResult = data.result;
                            WeixinJSBridge.invoke('getBrandWCPayRequest', {
                                "appId": jsonResult.appId, //公众号名称，由商户传入
                                "timeStamp": jsonResult.timeStamp, //时间戳
                                "nonceStr": jsonResult.nonceStr, //随机串
                                "package": jsonResult.package,//扩展包
                                "signType": jsonResult.signType, //微信签名方式:默认使用sha1，使用新版支付需传入MD5
                                "paySign": jsonResult.paySign //微信签名
                            },
                                function (res) {
                                    if (res.err_msg == "get_brand_wcpay_request:ok") {
                                        window.location.href = "http://www.igmhz.com/fengkong-living-h5/";
                                    } else {
                                        alert("取消支付");
                                    }
                                });
                        } else {
                            alert(data.errorMessage);
                        }
                    }
                })
                setTimeout(function () { clicktag = 0 }, 5000);
            }*/





            // 获取orderId进行下单
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'order/generateOrder.do',
                data: $.param({
                    userId: localStorage.userId,
                    courseId: courseId,
                    orderTurnover: $scope.coursePrice,
                    orderName: '微信下单',
                    orderType: 4, // orderType:1入场券支付  2线下支付  3 余额支付  4微信支付  5支付宝支付
                    payPath:1
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    var orderInfo = {};
                    var orderInfo = data.result;

                    console.log('orderId: ' + orderInfo.orderId);

                    $state.go('order_wechat', {
                        orderId: orderInfo.orderId,
                        orderCode: orderInfo.orderCode,
                        orderTurnover: orderInfo.orderTurnover,
                        description: orderInfo.description
                    });
                }
            })

        }

        //余额支付
        $scope.go = function () {

            // 获取orderId进行下单
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'order/generateOrder.do',
                data: $.param({
                    userId: localStorage.userId,
                    courseId: courseId,
                    orderTurnover: $scope.coursePrice,
                    orderName: '风控币下单',
                    orderType: 3, // orderType:1入场券支付  2线下支付  3 余额支付  4微信支付  5支付宝支付
                    payPath:1
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    PopService.showPop('下单成功');

                    var orderInfo = {};
                    var orderInfo = data.result;

                    console.log('orderId: ' + orderInfo.orderId);

                    $state.go('course_order', {
                        orderId: orderInfo.orderId,
                        orderCode: orderInfo.orderCode,
                        orderTurnover: orderInfo.orderTurnover,
                        description: orderInfo.description
                    });


                    /*$http({
                        method: 'POST',
                        url: ApiEndpoint.url + 'order/userBalancePay.do',
                        data: $.param({
                            userId: localStorage.userId,
                            payType: 3,  //1入场券支付  2线下支付  3余额支付 4 微信支付  5支付宝支付
                            orderId: orderInfo.orderId,
                            totalPrice: $scope.coursePrice
                        }),
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                    }).success(function (data) {
                        console.log(data.result);
                    })*/
                } else {
                    PopService.showError('下单失败');
                }
            })
        }

        //体验券支付
        $scope.payCoupon = function () {
            // 获取orderId进行下单
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'order/generateOrder.do',
                data: $.param({
                    userId: localStorage.userId,
                    courseId: courseId,
                    orderTurnover: $scope.coursePrice,
                    orderName: '体验券下单',
                    orderType: 1, // orderType:1体验券支付  2线下支付  3 余额支付  4微信支付  5支付宝支付
                    payPath:1
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    var orderInfo = {};
                    var orderInfo = data.result;

                    console.log('orderId: ' + orderInfo.orderId);

                    $state.go('change_coupon', {
                        orderId: orderInfo.orderId
                    });
                }
            })
        }

    })

    //确认订单--课程视频、录播视频
    .controller('ConfirmOrderVideoCtrl', function ($scope, $http, $timeout, $ionicHistory, $ionicModal, $state,$stateParams, ApiEndpoint,PopService) {
        $scope.goBack = function () {
            $ionicHistory.goBack();
        }

        $scope.hasCourse = false;
        var videoId = $stateParams.videoId;


        $http({
            method: 'POST',
            url: ApiEndpoint.url + 'video/getCourseIdByVideo.do',//根据videoId获取是否有courseId
            data: $.param({
                videoId: videoId
            }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function(data){
            if(data.errorCode == 0){
                if(data.result == 0){
                    $scope.hasCourse = false;
                }else if(data.result > 0){
                    $scope.hasCourse = true;
                    var courseId = data.result;
                    //获取课程信息
                    $http({
                        method: 'POST',
                        url: ApiEndpoint.url + 'course/getCourseById.do',
                        data: $.param({
                            userId: localStorage.userId,
                            courseId: courseId,
                            // type(点赞类型):1直播 2视频 3课程
                            type: 3,
                            //collectType(收藏类型):1课程 2视频
                            collectType: 1
                        }),
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                    }).success(function (data) {
                        if (data.errorCode == 0) {
                            $scope.courseName = data.result.course.courseName;
                        }
                    })
                }
            }
        })

        $http({
            method: 'POST',
            url: ApiEndpoint.url + 'video/getVideoById.do',
            data: $.param({
                videoId: videoId
            }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function(data){
            if(data.errorCode == 0){
                console.log(data.result);
                $scope.videoName = data.result.videoName;
                $scope.videoPrice = data.result.videoPrice;

                //获取orderId
                $http({
                    method: 'POST',
                    url: ApiEndpoint.url + 'order/generateOrder.do',
                    data: $.param({
                        userId: localStorage.userId,
                        videoId: videoId,
                        orderTurnover: $scope.videoPrice
                    }),
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                }).success(function (data) {
                    if (data.errorCode == 0) {
                        $scope.orderId = data.result.orderId;
                    }
                })
            }
        })
        

        /*//微信支付
        $scope.wechatPay = function () {
            var orderId = $scope.orderId;
            console.log('orderId: ' + orderId);

            var clicktag = 0;
            if (clicktag == 0) {
                clicktag = 1;

                $.ajax({
                    type: 'GET',
                    url: 'http://www.igmhz.com/fengkong-server/wechat/getPrepareId.do',
                    data: { openID: 'oPjcrs-c2-k1rUS8Qd6bQOQZvTZE', orderId: orderId },
                    success: function (data) {
                        if (data.errorCode == 0) {
                            var jsonResult = data.result;
                            WeixinJSBridge.invoke('getBrandWCPayRequest', {
                                "appId": jsonResult.appId, //公众号名称，由商户传入
                                "timeStamp": jsonResult.timeStamp, //时间戳
                                "nonceStr": jsonResult.nonceStr, //随机串
                                "package": jsonResult.package,//扩展包
                                "signType": jsonResult.signType, //微信签名方式:默认使用sha1，使用新版支付需传入MD5
                                "paySign": jsonResult.paySign //微信签名
                            },
                                function (res) {
                                    if (res.err_msg == "get_brand_wcpay_request:ok") {
                                        window.location.href = "http://www.igmhz.com/fengkong-living-h5/";
                                    } else {
                                        alert("取消支付");
                                    }
                                });
                        } else {
                            alert(data.errorMessage);
                        }
                    }
                })
                setTimeout(function () { clicktag = 0 }, 5000);
            }
        }*/


        $scope.pay = function () {
            $ionicModal.fromTemplateUrl('modal.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function (modal) {
                $scope.modal = modal;
                $scope.openModal();
            });


            $scope.openModal = function () {
                $scope.modal.show();
            };
            $scope.closeModal = function () {
                $scope.modal.hide();
            };
            //当我们用到模型时，清除它！
            $scope.$on('$destroy', function () {
                $scope.modal.remove();
            });
            // 当隐藏的模型时执行动作
            $scope.$on('modal.hide', function () {
                // 执行动作
            });
            // 当移动模型时执行动作
            $scope.$on('modal.removed', function () {
                // 执行动作
            });
        }


        //支付宝支付
        $scope.aliPay = function () {
            // 获取orderId进行下单
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'order/generateOrder.do',
                data: $.param({
                    userId: localStorage.userId,
                    videoId: videoId,
                    orderTurnover: $scope.videoPrice,
                    orderName: '支付宝下单',
                    orderType: 5, // orderType:1入场券支付  2线下支付  3 余额支付  4微信支付  5支付宝支付
                    payPath:1
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    PopService.showPop('下单成功');

                    var orderInfo = {};
                    var orderInfo = data.result;

                    console.log('orderId: ' + orderInfo.orderId);

                    $state.go('alipay', {
                        orderId: orderInfo.orderId,
                        orderCode: orderInfo.orderCode,
                        orderTurnover: orderInfo.orderTurnover,
                        description: orderInfo.description
                    });
                } else {
                    PopService.showError('下单失败');
                }
            })
        }

        //微信支付
        $scope.wechatPay = function () {
            // 获取orderId进行下单
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'order/generateOrder.do',
                data: $.param({
                    userId: localStorage.userId,
                    videoId: videoId,
                    orderTurnover: $scope.videoPrice,
                    orderName: '微信下单',
                    orderType: 4, // orderType:1入场券支付  2线下支付  3 余额支付  4微信支付  5支付宝支付
                    payPath:1
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    var orderInfo = {};
                    var orderInfo = data.result;

                    console.log('orderId: ' + orderInfo.orderId);

                    $state.go('order_wechat', {
                        orderId: orderInfo.orderId,
                        orderCode: orderInfo.orderCode,
                        orderTurnover: orderInfo.orderTurnover,
                        description: orderInfo.description
                    });
                }else {
                    PopService.showError('下单失败');
                }
            })
        }


        //余额支付
        $scope.go = function () {
            // 获取orderId进行下单
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'order/generateOrder.do',
                data: $.param({
                    userId: localStorage.userId,
                    videoId: videoId,
                    orderTurnover: $scope.videoPrice,
                    orderName: '风控币下单',
                    orderType: 3, // orderType:1入场券支付  2线下支付  3 余额支付  4微信支付  5支付宝支付
                    payPath:1
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    PopService.showPop('下单成功');

                    var orderInfo = {};
                    var orderInfo = data.result;

                    console.log('orderId: ' + orderInfo.orderId);

                    $state.go('course_order', {
                        orderId: orderInfo.orderId,
                        orderCode: orderInfo.orderCode,
                        orderTurnover: orderInfo.orderTurnover,
                        description: orderInfo.description
                    });
                } else {
                    PopService.showError('下单失败');
                }
            })
        }


        //体验券支付
        $scope.payCoupon = function () {
            // 获取orderId进行下单
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'order/generateOrder.do',
                data: $.param({
                    userId: localStorage.userId,
                    videoId: videoId,
                    orderTurnover: $scope.videoPrice,
                    orderName: '体验券下单',
                    orderType: 1, // orderType:1体验券支付  2线下支付  3 余额支付  4微信支付  5支付宝支付
                    payPath:1
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    var orderInfo = {};
                    var orderInfo = data.result;

                    console.log('orderId: ' + orderInfo.orderId);

                    $state.go('change_coupon', {
                        orderId: orderInfo.orderId
                    });
                }else {
                    PopService.showError('下单失败');
                }
            })
        }

    })

    //确认订单--即将直播 和 正在直播
    .controller('ConfirmOrderLiveCtrl', ['$scope', '$ionicPopover', '$http', '$timeout', '$ionicHistory', '$ionicModal', '$state', '$stateParams', 'ApiEndpoint', 'PopService', function ($scope, $ionicPopover, $http, $timeout, $ionicHistory, $ionicModal, $state, $stateParams, ApiEndpoint, PopService) {
        $scope.goBack = function () {
            $ionicHistory.goBack();
        }

        var liveId = $stateParams.liveId;

        $http({
            method: 'POST',
            url: ApiEndpoint.url + 'enroll/sureEnroll.do',
            data: $.param({
                userId: localStorage.userId,
                ObjectId: liveId,
                enrollType: 1  //enrollType:1直播报名  2活动报名
            }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function (data) {
            if (data.errorCode == 0) {
                $scope.liveInfo = data.result;
                console.log($scope.liveInfo);
            }
        })


        $scope.pay = function () {
            $ionicModal.fromTemplateUrl('modal.html', {
                scope: $scope,
                animation: 'slide-in-up',
                // backdropClickToClose:true
            }).then(function (modal) {
                $scope.modal = modal;
                $scope.openModal();
            });


            $scope.openModal = function () {
                $scope.modal.show();
            };
            $scope.closeModal = function () {
                $scope.modal.hide();
            };
            //当我们用到模型时，清除它！
            $scope.$on('$destroy', function () {
                $scope.modal.remove();
            });
            // 当隐藏的模型时执行动作
            $scope.$on('modal.hide', function () {
                // 执行动作
            });
            // 当移动模型时执行动作
            $scope.$on('modal.removed', function () {
                // 执行动作
            });
        }


        //支付宝支付
        $scope.aliPay = function () {
            // 获取orderId进行下单
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'order/generateOrder.do',
                data: $.param({
                    userId: localStorage.userId,
                    liveId: liveId,
                    orderTurnover: $scope.liveInfo.livePrice,
                    orderName: '支付宝下单',
                    orderType: 5, // orderType:1入场券支付  2线下支付  3 余额支付  4微信支付  5支付宝支付
                    payPath:1
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    PopService.showPop('下单成功');

                    var orderInfo = {};
                    var orderInfo = data.result;

                    console.log('orderId: ' + orderInfo.orderId);

                    $state.go('alipay', {
                        orderId: orderInfo.orderId,
                        orderCode: orderInfo.orderCode,
                        orderTurnover: orderInfo.orderTurnover,
                        description: orderInfo.description
                    });
                } else {
                    PopService.showError('下单失败');
                }
            })
        }


        //微信支付
        $scope.wechatPay = function () {
            // 获取orderId进行下单
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'order/generateOrder.do',
                data: $.param({
                    userId: localStorage.userId,
                    liveId: liveId,
                    orderTurnover: $scope.liveInfo.livePrice,
                    orderName: '微信下单',
                    orderType: 4, // orderType:1入场券支付  2线下支付  3 余额支付  4微信支付  5支付宝支付
                    payPath:1
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    var orderInfo = {};
                    var orderInfo = data.result;

                    console.log('orderId: ' + orderInfo.orderId);

                    $state.go('order_wechat', {
                        orderId: orderInfo.orderId,
                        orderCode: orderInfo.orderCode,
                        orderTurnover: orderInfo.orderTurnover,
                        description: orderInfo.description
                    });
                }
            })
        }


        //余额支付
        $scope.go = function () {
            // 获取orderId进行下单
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'order/generateOrder.do',
                data: $.param({
                    userId: localStorage.userId,
                    liveId: liveId,
                    orderTurnover: $scope.liveInfo.livePrice,
                    orderName: '风控币下单',
                    orderType: 3, // orderType:1入场券支付  2线下支付  3 余额支付  4微信支付  5支付宝支付
                    payPath:1
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    PopService.showPop('下单成功');

                    var orderInfo = {};
                    var orderInfo = data.result;

                    console.log('orderId: ' + orderInfo.orderId);

                    $state.go('course_order', {
                        orderId: orderInfo.orderId,
                        orderCode: orderInfo.orderCode,
                        orderTurnover: orderInfo.orderTurnover,
                        description: orderInfo.description
                    });
                } else {
                    PopService.showError('下单失败');
                }
            })
        }


        //体验券支付
        $scope.payCoupon = function () {
            // 获取orderId进行下单
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'order/generateOrder.do',
                data: $.param({
                    userId: localStorage.userId,
                    liveId: liveId,
                    orderTurnover: $scope.liveInfo.livePrice,
                    orderName: '体验券下单',
                    orderType: 1, // orderType:1体验券支付  2线下支付  3 余额支付  4微信支付  5支付宝支付
                    payPath:1
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    var orderInfo = {};
                    var orderInfo = data.result;

                    console.log('orderId: ' + orderInfo.orderId);

                    $state.go('change_coupon', {
                        orderId: orderInfo.orderId
                    });
                }
            })
        }
    }])

    //确认订单--直播已结束
    .controller('ConfirmOrderLivingEndedCtrl', ['$scope', '$ionicPopover', '$http', '$timeout', '$ionicHistory', '$ionicModal', '$state', '$stateParams', 'ApiEndpoint', 'PopService', function ($scope, $ionicPopover, $http, $timeout, $ionicHistory, $ionicModal, $state, $stateParams, ApiEndpoint, PopService) {
        $scope.goBack = function () {
            $ionicHistory.goBack();
        }

        var videoId = $stateParams.videoId;

        $scope.noInfo = false;

        $http({
            method: 'POST',
            url: ApiEndpoint.url + 'video/getVideoById.do',
            data: $.param({
                videoId: videoId
            }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function (data) {
            if (data.errorCode == 0) {
                $scope.videoName = data.result.videoName;
                $scope.videoPrice = data.result.videoPrice;
            }else if(data.errorCode == 21){
                //已结束的直播尚未在后台添加相关信息
                $scope.noInfo = true;
            }
        })


        $scope.pay = function () {
            $ionicModal.fromTemplateUrl('modal.html', {
                scope: $scope,
                animation: 'slide-in-up',
                // backdropClickToClose:true
            }).then(function (modal) {
                $scope.modal = modal;
                $scope.openModal();
            });


            $scope.openModal = function () {
                $scope.modal.show();
            };
            $scope.closeModal = function () {
                $scope.modal.hide();
            };
            //当我们用到模型时，清除它！
            $scope.$on('$destroy', function () {
                $scope.modal.remove();
            });
            // 当隐藏的模型时执行动作
            $scope.$on('modal.hide', function () {
                // 执行动作
            });
            // 当移动模型时执行动作
            $scope.$on('modal.removed', function () {
                // 执行动作
            });
        }


        //支付宝支付
        $scope.aliPay = function () {
            // 获取orderId进行下单
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'order/generateOrder.do',
                data: $.param({
                    userId: localStorage.userId,
                    liveId: videoId,
                    orderTurnover: $scope.videoPrice,
                    orderName: '支付宝下单',
                    orderType: 5, // orderType:1入场券支付  2线下支付  3 余额支付  4微信支付  5支付宝支付
                    payPath:1
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    PopService.showPop('下单成功');

                    var orderInfo = {};
                    var orderInfo = data.result;

                    console.log('orderId: ' + orderInfo.orderId);

                    $state.go('alipay', {
                        orderId: orderInfo.orderId,
                        orderCode: orderInfo.orderCode,
                        orderTurnover: orderInfo.orderTurnover,
                        description: orderInfo.description
                    });
                } else {
                    PopService.showError('下单失败');
                }
            })
        }


        //微信支付
        $scope.wechatPay = function () {
            // 获取orderId进行下单
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'order/generateOrder.do',
                data: $.param({
                    userId: localStorage.userId,
                    liveId: videoId,
                    orderTurnover: $scope.videoPrice,
                    orderName: '微信下单',
                    orderType: 4, // orderType:1入场券支付  2线下支付  3 余额支付  4微信支付  5支付宝支付
                    payPath:1
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    var orderInfo = {};
                    var orderInfo = data.result;

                    console.log('orderId: ' + orderInfo.orderId);

                    $state.go('order_wechat', {
                        orderId: orderInfo.orderId,
                        orderCode: orderInfo.orderCode,
                        orderTurnover: orderInfo.orderTurnover,
                        description: orderInfo.description
                    });
                }
            })
        }

        //余额支付
        $scope.go = function () {
            // 获取orderId进行下单
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'order/generateOrder.do',
                data: $.param({
                    userId: localStorage.userId,
                    liveId: videoId,
                    orderTurnover: $scope.videoPrice,
                    orderName: '风控币下单',
                    orderType: 3, // orderType:1入场券支付  2线下支付  3 余额支付  4微信支付  5支付宝支付
                    payPath:1
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    PopService.showPop('下单成功');

                    var orderInfo = {};
                    var orderInfo = data.result;

                    console.log('orderId: ' + orderInfo.orderId);

                    $state.go('course_order', {
                        orderId: orderInfo.orderId,
                        orderCode: orderInfo.orderCode,
                        orderTurnover: orderInfo.orderTurnover,
                        description: orderInfo.description
                    });
                } else {
                    PopService.showError('下单失败');
                }
            })
        }

        //体验券支付
        $scope.payCoupon = function () {
            // 获取orderId进行下单
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'order/generateOrder.do',
                data: $.param({
                    userId: localStorage.userId,
                    liveId: videoId,
                    orderTurnover: $scope.videoPrice,
                    orderName: '体验券下单',
                    orderType: 1, // orderType:1体验券支付  2线下支付  3 余额支付  4微信支付  5支付宝支付
                    payPath:1
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    var orderInfo = {};
                    var orderInfo = data.result;

                    console.log('orderId: ' + orderInfo.orderId);

                    $state.go('change_coupon', {
                        orderId: orderInfo.orderId
                    });
                }
            })
        }

    }])

    .factory('CouponService', function () {
        return {
            couponInfo: {}
        }
    })
    //选择体验券
    .controller('ChangeCouponCtrl', function ($scope, $http, $ionicHistory, $state, $stateParams, ApiEndpoint, PopService, CouponService) {
        $scope.goBack = function () {
            $ionicHistory.goBack();
        }

        var orderId = $stateParams.orderId;

        function getcouponList() {
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'coupon/getUserCouponList.do',
                data: $.param({
                    userId: localStorage.userId
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    $scope.couponList = data.result;
                }
            })
        }
        getcouponList();


        $scope.selectCoupon = function (e, couponId) {
            CouponService.couponInfo.couponId = couponId;
            console.log(CouponService.couponInfo.couponId);
        }


        $scope.pay = function () {
            if (CouponService.couponInfo.couponId == undefined) {
                PopService.showPop('请选择体验券');
                return;
            }
            console.log(CouponService.couponInfo.couponId);

            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'order/reedeemPay.do',
                data: $.param({
                    userId: localStorage.userId,
                    orderId: orderId,
                    couponId: CouponService.couponInfo.couponId
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    PopService.showPop('支付成功');
                    // getcouponList();
                    $state.go('tabs.myself');
                }
            })
        }
    })

    //正在直播详情
    .controller('LivingDetailCtrl', function ($scope, $ionicHistory, $stateParams, ApiEndpoint, $http, PopService) {
        $scope.goBack = function () {
            $ionicHistory.goBack();
        }

        var liveId = $stateParams.liveId;

        $http({
            method: 'POST',
            url: ApiEndpoint.url + 'live/getLiveDeatilById.do',
            data: $.param({
                liveId: liveId
            }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function(data){
            if(data.errorCode == 0){
                console.log(data.result);
                $scope.livingInfo = data.result;
            }
        })


        // 获取直播的拉流地址
        $http({
            method: 'POST',
            url: ApiEndpoint.url + 'live/getLiveUrl.do',
            data: $.param({
                liveId: liveId
            }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function (data) {
            if (data.errorCode == 0) {
                var url = data.result.pullStreamHls;

                var myPlayer = neplayer('my-video', {}, function () {
                    console.log('播放器初始化完成');
                });
                var playerTech = videojs("my-video").tech({ IWillNotUseThisInPlugins: true });
                myPlayer.onPlayState(1, function () {
                    console.log('play');
                });
                myPlayer.onPlayState(2, function () {
                    console.log('pause');
                });
                myPlayer.onPlayState(3, function () { console.log('ended') });
                myPlayer.onError(function (data) { console.log(data) });


                myPlayer.setDataSource({ type: 'application/x-mpegURL', src: url });
                myPlayer.play();

                $scope.$on('$ionicView.beforeLeave', function () {
                    myPlayer.release();
                });
            }
        })


        $scope.zan_flag = false;//当前用户的正在直播点赞状态
        $scope.liveEarnedPeople = 0;//正在直播点赞人数
        //获取正在直播点赞状态
        function getLiveEarnInfo(){
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'live/getLiveEarnedStatus.do',
                data: $.param({
                    userId:localStorage.userId,
                    liveId: liveId
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function(data){
                if(data.errorCode == 0){
                    // data.result.liveEarnedStatus:0未点赞  1已点赞
                    if(data.result.liveEarnedStatus == 0){
                        $scope.zan_flag = false;
                    }else if(data.result.liveEarnedStatus == 1){
                        $scope.zan_flag = true;
                    }
                    $scope.liveEarnedPeople = data.result.liveEarnedPeople;
                }
            })
        }
        getLiveEarnInfo();
        // 添加点赞
        $scope.zan = function () {
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'live/addEarnedNumber.do',
                data: $.param({
                    userId: localStorage.userId,
                    liveId: liveId
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    PopService.showPop('点赞成功');
                    $scope.zan_flag = true;

                    getLiveEarnInfo();
                }
            })
        }
        // 取消点赞
        $scope.cancelZan = function(){
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'live/cancelEarned.do',
                data: $.param({
                    userId: localStorage.userId,
                    liveId:liveId,
                    videoId:0,
                    courseId: 0,
                    //点赞类型earnedType:1直播  2视频  3课程
                    earnedType: 1
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    PopService.showPop('取消点赞成功');
                    $scope.zan_flag = false;

                    getLiveEarnInfo();
                }else{
                    PopService.showPop(data.errorMessage);
                }
            })
        }


        //获取用户评论
        function getCommentList() {
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'comment/getCommentList.do',
                data: $.param({
                    liveId: liveId,
                    courseId: 0,
                    videoId: 0,
                    //commentType:1直播 2视频 3课程
                    commentType: 1
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    $scope.commentLiveList = data.result;
                    $scope.commentLiveListLength = data.result.length;
                }
            })
        }
        getCommentList();

        // 用户评论直播
        $scope.living = {};
        $scope.evaluate = function () {
            if ($scope.living.evaluation == undefined || $scope.living.evaluation == '') {
                PopService.showPop('评论不能为空');
            } else {
                $http({
                    method: 'POST',
                    url: ApiEndpoint.url + 'comment/addUserCommentLive.do',
                    data: $.param({
                        userId: localStorage.userId,
                        commentType: 1,/*评论类型:1直播 2视频 3课程*/
                        commentObjectId: liveId,
                        commentContent: $scope.living.evaluation
                    }),
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                }).success(function (data) {
                    if (data.errorCode == 0) {
                        PopService.showPop('评论成功');
                        $scope.living.evaluation = '';
                        getCommentList();
                    }
                })
            }
        }

    })


    //录播课程列表
    .controller('RecordedListCtrl', function ($scope, $http, $ionicHistory, $rootScope, $stateParams, $state, ApiEndpoint, PopService) {
        $scope.courseId = $stateParams.courseId;
        console.log('courseID ' + $scope.courseId);

        $scope.goBack = function () {
            //$ionicHistory.goBack();
            $rootScope.$ionicGoBack();
        }


        $scope.currentCourseCollectPeople = 0;//课程收藏人数
        $scope.currentCourseEarnedPeople = 0;//课程点赞人数
        // 获取用户的课程收藏点赞状态
        function getCourseCollectAndEarnInfo(){
            $http.post(ApiEndpoint.url + 'course/getCourseById.do', {}, {
                params: {
                    userId: localStorage.userId,
                    courseId: $scope.courseId,
                    // type(点赞类型):1直播 2视频 3课程
                    type: 3,
                    //collectType(收藏类型):1课程 2视频
                    collectType: 1
                }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    $scope.collection_flag = data.result.collectStatus;
                    $scope.zan_flag = data.result.earnedStatus;

                    $scope.currentCourseCollectPeople = data.result.currentCourseCollectPeople;
                    $scope.currentCourseEarnedPeople = data.result.currentCourseEarnedPeople;
                }
            })
        }
        getCourseCollectAndEarnInfo();

        // 添加收藏
        $scope.collection_flag = false;
        $scope.progress_collection = function () {
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'collect/collect.do',
                data: $.param({
                    userId: localStorage.userId,
                    collectedId: $scope.courseId,
                    //收藏类型type:1课程 2视频
                    type: 1
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    PopService.showPop('收藏成功');
                    $scope.collection_flag = true;

                    getCourseCollectAndEarnInfo();
                }
            })
        }
        // 取消收藏
        $scope.cancelCollect = function(){
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'collect/deleteUserCollect.do',
                data: $.param({
                    userId: localStorage.userId,
                    collectId: $scope.courseId,
                    //收藏类型type:1课程 2视频
                    collectType: 1
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    PopService.showPop('取消收藏成功');
                    $scope.collection_flag = false;

                    getCourseCollectAndEarnInfo();
                }
            })
        }

        // 添加点赞
        $scope.zan_flag = false;
        $scope.zan = function () {
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'course/courseEarnedNumber.do',
                data: $.param({
                    userId: localStorage.userId,
                    courseId: $scope.courseId
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    PopService.showPop('点赞成功');
                    $scope.zan_flag = true;

                    getCourseCollectAndEarnInfo();
                }
            })
        }
        // 取消点赞
        $scope.cancelZan = function(){
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'live/cancelEarned.do',
                data: $.param({
                    userId: localStorage.userId,
                    liveId:0,
                    videoId:0,
                    courseId: $scope.courseId,
                    //点赞类型earnedType:1直播  2视频  3课程
                    earnedType: 3
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    PopService.showPop('取消点赞成功');
                    $scope.zan_flag = false;

                    getCourseCollectAndEarnInfo();
                }
            })
        }



        $('.progress_tab_change_selected').on('click', function () {
            $(this).addClass('active1').siblings().removeClass('active1');
            $('#progress_recorded_detail_content > div').css('display', 'none');
            switch ($(this).index()) {
                case 0: $('#progress_recorded_related').css('display', 'block'); break;
                case 1: $('#progress_recorded_detail').css('display', 'block'); break;
                case 2: $('#progress_recorded_comment').css('display', 'block'); break;

            }
        })

        

        //底部'购买课程'按钮显示状态
        $scope.courseBuyStatus = false;

        //课程安排(userId用来获取该用户是否购买该课程)
        $http.post(ApiEndpoint.url + 'video/getCourseVideoForH5.do', {}, {
            params: {
                userId: localStorage.userId,
                courseId: $scope.courseId
            }
        }).success(function (data) {
            if (data.errorCode == 0) {
                $scope.courseInfo = {};
                // 获取课程名称
                $scope.courseInfo.courseName = data.result.course.courseName;
                // 获取课程价格
                $scope.courseInfo.coursePrice = data.result.course.price;
                // 获取课程封面地址
                $scope.courseInfo.imgUrl = data.result.course.imageUrl;
                // 获取用户购买课程状态courseIsPay:0未购买 1已购买
                if (data.result.courseVideoForH5.length > 0) {
                    $scope.courseInfo.courseIsPay = data.result.courseVideoForH5[0].courseIsPay;

                    $scope.recordedCourseList = data.result.courseVideoForH5;
                }


                //如果课程免费,那么该课程下的所有课时肯定全部免费
                if ($scope.courseInfo.coursePrice == 0) {
                    console.log('课程免费');
                    $scope.courseBuyStatus = false;
                } else if ($scope.courseInfo.coursePrice > 0) {
                    if ($scope.courseInfo.courseIsPay == 0) {
                        console.log('课程收费且未支付');
                        $scope.courseBuyStatus = true;
                    } else if ($scope.courseInfo.courseIsPay == 1) {
                        console.log('课程收费但已支付');
                        $scope.courseBuyStatus = false;
                    }
                }
            }
        })

        //课程--详情
        $scope.getCourseDetail = function () {
            $http.post(ApiEndpoint.url + 'course/getCourseDetail.do', {}, {
                params: {
                    courseId: $scope.courseId
                }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    $scope.courseDetail = data.result;
                }
            })
        }


        // 用户评论课程
        $scope.recordList = {};
        $scope.evaluate = function () {
            if ($scope.recordList.evaluation == undefined || $scope.recordList.evaluation == '') {
                PopService.showPop('评论不能为空');
            } else {
                $http({
                    method: 'POST',
                    url: ApiEndpoint.url + 'comment/addUserCommentLive.do',
                    data: $.param({
                        userId: localStorage.userId,
                        commentType: 3,/*评论类型:1直播 2视频 3课程*/
                        commentObjectId: $scope.courseId,
                        commentContent: $scope.recordList.evaluation
                    }),
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                }).success(function (data) {
                    if (data.errorCode == 0) {
                        PopService.showPop('评论成功');
                        $scope.recordList.evaluation = '';
                        getCommentList();
                    }
                })
            }
        }
        //获取用户评论
        function getCommentList() {
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'comment/getCommentList.do',
                data: $.param({
                    liveId: 0,
                    courseId: $scope.courseId,
                    videoId: 0,
                    //commentType:1直播 2视频 3课程
                    commentType: 3
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    $scope.commentList = data.result;
                }
            })
        }
        getCommentList();


        //点击'购买课程'存储生成订单所需信息
        $scope.createCourseOrder = function () {
            $state.go('confirm_order_course', {
                courseId: $scope.courseId
            });
        }

    })


    //所有的视频详情(包括录播课程的课时详情、不属于课程的视频、直播已结束转录播的视频、活动视频共同页面)
    .controller('VideoCtrl', function ($scope, $ionicHistory, $http, $state, $stateParams, $timeout, $ionicPopup, ApiEndpoint, PopService) {
        $scope.goBack = function () {
            $ionicHistory.goBack();
        }

        $scope.videoId = $stateParams.videoId;



        //底部立即购买按钮
        $scope.hasCourse = false;
        $scope.btnBuyStatus = false;



        //获取视频信息及准备播放器
        $scope.getVideoInfo = function () {
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'video/getVideoById.do',
                data: $.param({
                    videoId: $scope.videoId
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    $scope.videoResult = data.result;                   
                }
            })
        }
        $scope.getVideoInfo();


        function videoPlay(){
            var myPlayer = neplayer('my-video',
                {
                    "controls": true, //是否显示控制条
                    "autoplay": false, //是否自动播放(ios不支持自动播放)
                    /*预加载选项*/
                    "preload": "auto",
                    /*
                    'auto'预加载视频（需要浏览器允许）;
                    'metadata'仅预加载视频meta信息;
                    'none'不预加载;
                    */
                    "poster": $scope.videoResult.videoIcon, //视频播放前显示的图片
                    // "techOrder": ["flash", "html5"], //优先使用的播放模式
                    //设置不显示大播放按钮
                    bigPlayButton: false,
                    controlBar: {
                        'playToggle': true,
                        'volumeMenuButton': true,
                        'progressControl': true,
                        'liveDisplay': true,
                        'fullscreenToggle': true,

                        'currentTimeDisplay': true,
                        'timeDivider': true,
                        'durationDisplay': true,
                        'remainingTimeDisplay': false
                    }
                },
                function () {
                    console.log('播放器初始化完成');
                    myPlayer.setDataSource({ type: 'video/mp4', src: $scope.videoResult.videoUrl });
                }
            );


            // var playerTech = videojs("my-video").tech({ IWillNotUseThisInPlugins: true });
            myPlayer.onPlayState(1, function () {
                console.log('play');
            });
            myPlayer.onPlayState(2, function () {
                console.log('pause');
            });
            myPlayer.onPlayState(3, function () {
                console.log('ended');
            });
            myPlayer.onError(function (data) {
                console.log(data);
            });

            $scope.$on('$ionicView.beforeLeave', function () {
                myPlayer.release();
            });
        }


        $http({
            method: 'POST',
            url: ApiEndpoint.url + 'video/getCourseIdByVideo.do',//根据videoId获取是否有courseId
            data: $.param({
                videoId: $scope.videoId
            }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function (data) {
            if (data.errorCode == 0) {
                /*
                 * data.result 大于 0 时表示该视频是课程视频,所属课程的courseId为data.result;
                 * data.result 等于 0 时表示该视频是其他视频(包括录播视频、直播已结束视频、活动视频)
                */
                if (data.result > 0) {//属于课程视频
                    console.log('属于课程视频');
                    $scope.hasCourse = true;
                    $scope.courseId = data.result;
                    console.log('courseId: ' + $scope.courseId);

                    //获取课时所属的课程免费收费状态和该课程的用户付费状态
                    $http({
                        method: 'POST',
                        url: ApiEndpoint.url + 'video/getCourseVideoForH5.do',
                        data: $.param({
                            userId: localStorage.userId,
                            courseId: $scope.courseId
                        }),
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                    }).success(function (data) {
                        if (data.errorCode == 0) {
                            var courseInfo = data.result;
                            // courseIsPay课程付费状态: 0未付费  1已付费
                            var courseIsPay = courseInfo.courseVideoForH5[0].courseIspay;

                            var keepGoing = true;
                            angular.forEach(courseInfo.courseVideoForH5, function (value) {
                                if (keepGoing) {
                                    if ('courseIsPay' in value) {
                                        $scope.courseIsPayStatus = value.courseIsPay;
                                    }
                                    keepGoing = false;
                                }
                            })

                            console.log($scope.courseIsPayStatus);


                            //获取课时免费收费
                            $http({
                                method: 'POST',
                                url: ApiEndpoint.url + 'video/getVideoById.do',
                                data: $.param({
                                    videoId: $scope.videoId
                                }),
                                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                            }).success(function (data) {
                                if (data.errorCode == 0) {
                                    var videoResult = data.result;
                                    // 获取登录用户课时付费状态  selectType(查询类别):视频1 直播2 课程3 活动4
                                    function isPayStatus(selectType, videoId, liveId, courseId, activityId) {
                                        $http({
                                            method: 'POST',
                                            url: ApiEndpoint.url + "homePage/selectUserIsPayStatus.do",
                                            data: $.param({
                                                userId: localStorage.userId,
                                                selectType: selectType,
                                                videoId: videoId,
                                                liveId: liveId,
                                                courseId: courseId,
                                                activityId: activityId
                                            }),
                                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                                        }).success(function (data) {
                                            // isPay:(0:未付费),(>0:已付费)
                                            var videoPayStatus = data.result;

                                            console.log(courseInfo.course.price);
                                            console.log(typeof courseInfo.course.price);
                                            console.log(courseInfo.course.price > 0);

                                            console.log(courseIsPay);//undefined #####################################################这里有坑，取不到值，坑坑坑坑坑坑坑坑坑坑啊啊啊啊啊
                                            console.log($scope.courseIsPayStatus);
                                            //最终作判断
                                            if (courseInfo.course.price == 0) {
                                                console.log('课程免费');
                                                $scope.btnBuyStatus = false;
                                                videoPlay();
                                            } else if (courseInfo.course.price > 0) {
                                                if ($scope.courseIsPayStatus == 1) {
                                                    console.log('课程收费但用户已付费');
                                                    $scope.btnBuyStatus = false;
                                                    videoPlay();
                                                } else if ($scope.courseIsPayStatus == 0) {
                                                    if (videoResult.videoPrice == 0) {
                                                        console.log('课程收费且用户未付费,但课时免费');
                                                        $scope.btnBuyStatus = false;
                                                        videoPlay();
                                                    } else if (videoResult.videoPrice > 0) {
                                                        if (videoPayStatus.isPay == 0) {
                                                            console.log('课程收费且用户未付费,课时收费且用户未付费');
                                                            $scope.btnBuyStatus = true;
                                                        } else if (videoPayStatus.isPay > 0) {
                                                            console.log('课程收费且用户未付费,课时收费但用户已付费');
                                                            $scope.btnBuyStatus = false;
                                                            videoPlay();
                                                        }
                                                    }
                                                }
                                            }

                                        })
                                    }
                                    isPayStatus(1, $scope.videoId, 0, 0, 0);
                                }
                            })

                        }
                    })
                } else if (data.result == 0) {//不属于课程的其他视频(包括录播视频、直播已结束视频、活动视频)
                    console.log('不属于课程的其他视频(包括录播视频、直播已结束视频、活动视频)');
                    $scope.hasCourse = false;
                    //获取视频免费收费
                    $http({
                        method: 'POST',
                        url: ApiEndpoint.url + 'video/getVideoById.do',
                        data: $.param({
                            videoId: $scope.videoId
                        }),
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                    }).success(function (data) {
                        if (data.errorCode == 0) {
                            var videoResult = data.result;


                            // 获取登录用户视频的付费状态  selectType(查询类别):视频1 直播2 课程3 活动4
                            function isPayStatus(selectType, videoId, liveId, courseId, activityId) {
                                console.log(localStorage.userId, selectType, videoId, liveId, courseId, activityId);
                                $http.post(ApiEndpoint.url + "homePage/selectUserIsPayStatus.do", {}, {
                                    params: {
                                        userId: localStorage.userId,
                                        selectType: selectType,
                                        videoId: videoId,
                                        liveId: liveId,
                                        courseId: courseId,
                                        activityId: activityId
                                    }
                                }).success(function (data) {
                                    // isPay:(0:未付费),(>0:已付费)
                                    var videoPayStatus = data.result;


                                    //最终作判断
                                    if (videoResult.videoPrice == 0) {
                                        console.log('视频免费');
                                        $scope.btnBuyStatus = false;
                                        videoPlay();
                                    } else if (videoResult.videoPrice > 0) {
                                        if (videoPayStatus.isPay == 0) {
                                            console.log('视频收费且用户未付费');
                                            $scope.btnBuyStatus = true;
                                        } else if (videoPayStatus.isPay > 0) {
                                            console.log('视频收费但用户已付费');
                                            $scope.btnBuyStatus = false;
                                            videoPlay();
                                        }
                                    }

                                })
                            }
                            isPayStatus(1, $scope.videoId, 0, 0, 0);
                        }
                    })

                }
            }
        })


        $scope.currentVideoCollectPeople = 0;//视频的收藏人数
        $scope.currentVideoEarnedProle = 0;//视频的点赞人数
        // 获取视频的收藏和点赞状态
        function getVideoCollectAndEarned(){
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'video/getVideoCollectAndEarned.do',
                data: $.param({
                    userId: localStorage.userId,
                    videoId: $scope.videoId,
                    // collectType(收藏类型): 1课程  2视频
                    collectType:2,
                    // earnedType(点赞类型): 1直播  2视频  3课程
                    earnedType:2
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    if(data.result.videoCollectStatus == 0){
                        $scope.collection_flag = false;
                    }else if(data.result.videoCollectStatus == 1){
                        $scope.collection_flag = true;
                    }

                    if(data.result.videoEarnedStstus == 0){
                        $scope.zan_flag = false;
                    }else if(data.result.videoEarnedStstus == 1){
                        $scope.zan_flag = true;
                    }

                    $scope.currentVideoCollectPeople = data.result.currentVideoCollectPeople;
                    $scope.currentVideoEarnedProle = data.result.currentVideoEarnedProle;
                }
            })
        }
        getVideoCollectAndEarned();

        // 添加收藏
        $scope.collection_flag = false;
        $scope.progress_collection = function () {
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'collect/collect.do',
                data: $.param({
                    userId: localStorage.userId,
                    collectedId: $scope.videoId,
                    //收藏类型type:1课程 2视频
                    type: 2
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    PopService.showPop('收藏成功');
                    $scope.collection_flag = true;

                    getVideoCollectAndEarned();
                }
            })
        }
        // 取消收藏
        $scope.cancelCollect = function(){
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'collect/deleteUserCollect.do',
                data: $.param({
                    userId: localStorage.userId,
                    collectId: $scope.videoId,
                    //收藏类型type:1课程 2视频
                    collectType: 2
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    PopService.showPop('取消收藏成功');
                    $scope.collection_flag = false;

                    getVideoCollectAndEarned();
                }
            })
        }
        // 添加点赞
        $scope.zan_flag = false;
        $scope.zan = function () {
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'video/addVideoEarnedNumber.do',
                data: $.param({
                    userId: localStorage.userId,
                    videoId: $scope.videoId
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    PopService.showPop('点赞成功');
                    $scope.zan_flag = true;

                    getVideoCollectAndEarned();
                }
            })
        }
        // 取消点赞
        $scope.cancelZan = function(){
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'live/cancelEarned.do',
                data: $.param({
                    userId: localStorage.userId,
                    liveId:0,
                    videoId:$scope.videoId,
                    courseId: 0,
                    //点赞类型earnedType:1直播  2视频  3课程
                    earnedType: 2
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    PopService.showPop('取消点赞成功');
                    $scope.zan_flag = false;

                    getVideoCollectAndEarned();
                }
            })
        }


        $('.progress_tab_change_selected').on('click', function () {
            $('.progress_tab_change_selected').removeClass('active1');
            $(this).addClass('active1');
            $('#progress_recorded_detail_content > div').css('display', 'none');
            switch ($(this).index()) {
                case 0: $('#progress_recorded_comment').css('display', 'block'); break;
                case 1: $('#progress_recorded_detail').css('display', 'block'); break;
                case 2: $('#progress_recorded_related').css('display', 'block'); break;

            }
        })



        // 添加用户评论
        $scope.videoComment = {};
        $scope.evaluate = function () {
            if ($scope.videoComment.evaluation == undefined || $scope.videoComment.evaluation == '') {
                PopService.showPop('评论不能为空');
            } else {
                $http({
                    method: 'POST',
                    url: ApiEndpoint.url + 'comment/addUserCommentLive.do',
                    data: $.param({
                        userId: localStorage.userId,
                        commentType: 2,/*评论类型:1直播 2视频 3课程*/
                        commentObjectId: $scope.videoId,
                        commentContent: $scope.videoComment.evaluation
                    }),
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                }).success(function (data) {
                    if (data.errorCode == 0) {
                        PopService.showPop('评论成功');
                        $scope.videoComment.evaluation = '';
                        getCommentList();
                    }
                })
            }
        }
        //获取用户评论
        function getCommentList() {
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'comment/getCommentList.do',
                data: $.param({
                    liveId: 0,
                    courseId: 0,
                    videoId: $scope.videoId,
                    //commentType:1直播 2视频 3课程
                    commentType: 2
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    $scope.commentList = data.result;
                }
            })
        }
        getCommentList();

        //获取录播详情--详情
        $http({
            method: 'POST',
            url: ApiEndpoint.url + 'comment/getVideoDetail.do',
            data: $.param({
                videoId: $scope.videoId
            }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function (data) {
            if (data.errorCode == 0) {
                $scope.videoDetail = data.result[0];
            }
        })

        //获取录播详情--相关
        $http({
            method: 'POST',
            url: ApiEndpoint.url + 'comment/getvideoRelevant.do',
            data: $.param({
                videoId: $scope.videoId
            }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function (data) {
            if (data.errorCode == 0) {
                $scope.videoRelevantList = data.result;
            }
        })


        //点击'立即购买'到生成订单
        $scope.createCourseVideoOrder = function () {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Popup title',
                template: 'Popup text',
                cancelText: '购买视频',
                cancelType: '',
                okText: '购买课程',
                okType: ''
            });
            confirmPopup.then(function (res) {
                if (res) {
                    console.log('购买课程');
                    $state.go('confirm_order_course', {
                        courseId: $scope.courseId
                    });
                } else {
                    console.log('购买视频');
                    $state.go('confirm_order_video', {
                        videoId: $scope.videoId
                    });
                }
            });

            /*var htmlEl = angular.element(document.querySelector('html'));
            htmlEl.on('click', function (event) {
                if (event.target.nodeName === 'HTML') {
                    if (confirmPopup) {
                        confirmPopup.close();
                    }
                }
            });*/

        };

        //点击'立即购买'到生成订单
        $scope.createVideoOrder = function () {
            $state.go('confirm_order_video', {
                videoId: $scope.videoId
            });
        }
    })


    //不属于课程的视频详情
    .controller('RecordedVideoDetailCtrl', function ($scope, $ionicHistory, $http, $state, $stateParams, ApiEndpoint, PopService) {
        $scope.videoId = $stateParams.videoId;
        console.log('videoId: ' + $scope.videoId);


        $scope.goBack = function () {
            $ionicHistory.goBack();
        }


        //获取课时信息
        $scope.getVideoInfo = function () {
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'video/getVideoById.do',
                data: $.param({
                    videoId: $scope.videoId
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    $scope.videoResult = data.result;


                    var myPlayer = neplayer('my-video', {
                        "controls": true, //是否显示控制条
                        "autoplay": false, //是否自动播放(ios不支持自动播放)
                        /*预加载选项*/
                        "preload": "auto",
                        /*
                        'auto'预加载视频（需要浏览器允许）;
                        'metadata'仅预加载视频meta信息;
                        'none'不预加载;
                        */
                        "poster": $scope.videoResult.videoIcon, //视频播放前显示的图片
                        //设置显示大播放按钮
                        bigPlayButton: true,
                        controlBar: {
                            'playToggle': true,
                            'volumeMenuButton': true,
                            'progressControl': true,
                            'liveDisplay': true,
                            'fullscreenToggle': true,

                            'currentTimeDisplay': true,
                            'timeDivider': true,
                            'durationDisplay': true,
                            'remainingTimeDisplay': false
                        }
                    }, function () {
                        console.log('播放器初始化完成');
                        myPlayer.setDataSource({ type: 'video/mp4', src: $scope.videoResult.videoUrl });
                    });

                    var playerTech = videojs("my-video").tech({ IWillNotUseThisInPlugins: true });
                    myPlayer.onPlayState(1, function () {
                        console.log('play');
                    });
                    myPlayer.onPlayState(2, function () {
                        console.log('pause');
                    });
                    myPlayer.onPlayState(3, function () { console.log('ended') });
                    myPlayer.onError(function (data) { console.log(data) });


                    // myPlayer.setDataSource({ type: 'video/mp4', src: $scope.videoResult.videoUrl });
                    // myPlayer.play();

                    $scope.$on('$ionicView.beforeLeave', function () {
                        myPlayer.release();
                    });
                }
            })
        }
        $scope.getVideoInfo();


        //底部立即购买按钮
        $scope.btnBuyStatus = false;


        //获取课时免费收费
        $http({
            method: 'POST',
            url: ApiEndpoint.url + 'video/getVideoById.do',
            data: $.param({
                videoId: $scope.videoId
            }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function (data) {
            if (data.errorCode == 0) {
                var videoResult = data.result;


                // 获取登录用户课时付费状态  selectType(查询类别):视频1 直播2 课程3 活动4
                function isPayStatus(selectType, videoId, liveId, courseId, activityId) {
                    console.log(localStorage.userId, selectType, videoId, liveId, courseId, activityId);
                    $http.post(ApiEndpoint.url + "homePage/selectUserIsPayStatus.do", {}, {
                        params: {
                            userId: localStorage.userId,
                            selectType: selectType,
                            videoId: videoId,
                            liveId: liveId,
                            courseId: courseId,
                            activityId: activityId
                        }
                    }).success(function (data) {
                        // isPay:(0:未付费),(>0:已付费)
                        var videoPayStatus = data.result;


                        //最终作判断
                        /*if (courseInfo.course.price == 0) {
                            console.log('课程免费');
                            $scope.btnBuyStatus = false;
                        } else if (courseInfo.course.price > 0) {
                            if (courseIsPay == 1) {
                                console.log('课程收费但用户已付费');
                                $scope.btnBuyStatus = false;
                            } else if (courseIsPay == 0) {
                                if (videoResult.videoPrice == 0) {
                                    console.log('课程收费且用户未付费,但课时免费');
                                    $scope.btnBuyStatus = false;
                                } else if (videoResult.videoPrice > 0) {
                                    if (videoPayStatus.isPay == 0) {
                                        console.log('课程收费且用户未付费,课时收费且用户未付费');
                                        $scope.btnBuyStatus = true;
                                    } else if (videoPayStatus.isPay > 0) {
                                        console.log('课程收费且用户未付费,课时收费但用户已付费');
                                        $scope.btnBuyStatus = false;
                                    }
                                }
                            }
                        }*/



                        //最终作判断
                        if (videoResult.videoPrice == 0) {
                            console.log('课时免费');
                            $scope.btnBuyStatus = false;
                        } else if (videoResult.videoPrice > 0) {
                            if (videoPayStatus.isPay == 0) {
                                console.log('课时收费且用户未付费');
                                $scope.btnBuyStatus = true;
                            } else if (videoPayStatus.isPay > 0) {
                                console.log('课时收费但用户已付费');
                                $scope.btnBuyStatus = false;
                            }
                        }

                    })
                }
                isPayStatus(1, $scope.videoId, 0, 0, 0);
            }
        })






        // 收藏
        $scope.collection_flag = false;
        $scope.progress_collection = function () {
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'collect/collect.do',
                data: $.param({
                    userId: localStorage.userId,
                    collectedId: $scope.videoId,
                    //收藏类型type:1课程 2视频
                    type: 2
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    console.log('收藏成功');
                    $scope.collection_flag = true;
                } else if (data.errorCode == 23310) {
                    console.log('已经收藏过了,请不要重复收藏');
                    $scope.collection_flag = true;
                }
            })
        }

        // 点赞
        $scope.zan_flag = false;
        $scope.zan = function () {
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'video/addVideoEarnedNumber.do',
                data: $.param({
                    userId: localStorage.userId,
                    videoId: $scope.videoId
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    console.log('点赞成功');
                    $scope.zan_flag = true;
                } else if (data.errorCode == 202) {
                    console.log('已经点赞了');
                    $scope.zan_flag = true;
                }
            })
        }

        $('.progress_tab_change_selected').on('click', function () {
            $('.progress_tab_change_selected').removeClass('active1');
            $(this).addClass('active1');
            $('#progress_recorded_detail_content > div').css('display', 'none');
            switch ($(this).index()) {
                case 0: $('#progress_recorded_comment').css('display', 'block'); break;
                case 1: $('#progress_recorded_detail').css('display', 'block'); break;
                case 2: $('#progress_recorded_related').css('display', 'block'); break;

            }
        })



        // 用户评论课时
        $scope.videoComment = {};
        $scope.evaluate = function () {
            if ($scope.videoComment.evaluation == undefined || $scope.videoComment.evaluation == '') {
                PopService.showPop('评论不能为空');
            } else {
                $http({
                    method: 'POST',
                    url: ApiEndpoint.url + 'comment/addUserCommentLive.do',
                    data: $.param({
                        userId: localStorage.userId,
                        commentType: 2,/*评论类型:1直播 2视频 3课程*/
                        commentObjectId: $scope.videoId,
                        commentContent: $scope.videoComment.evaluation
                    }),
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                }).success(function (data) {
                    if (data.errorCode == 0) {
                        PopService.showPop('评论成功');
                        $scope.videoComment.evaluation = '';
                        getCommentList();
                    }
                })
            }
        }
        //获取用户评论
        function getCommentList() {
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'comment/getCommentList.do',
                data: $.param({
                    liveId: 0,
                    courseId: 0,
                    videoId: $scope.videoId,
                    //commentType:1直播 2视频 3课程
                    commentType: 2
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    $scope.commentList = data.result;
                }
            })
        }
        getCommentList();

        //获取录播详情--详情
        $http({
            method: 'POST',
            url: ApiEndpoint.url + 'comment/getVideoDetail.do',
            data: $.param({
                videoId: $scope.videoId
            }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function (data) {
            if (data.errorCode == 0) {
                $scope.videoDetail = data.result[0];
            }
        })

        //获取录播详情--相关
        $http({
            method: 'POST',
            url: ApiEndpoint.url + 'comment/getvideoRelevant.do',
            data: $.param({
                videoId: $scope.videoId
            }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function (data) {
            if (data.errorCode == 0) {
                $scope.videoRelevantList = data.result;
            }
        })


    })

    //直播已结束详情
    .controller('LivingEndedDetailCtrl', function ($scope, $ionicHistory, $http, $state, $stateParams, ApiEndpoint, PopService) {
        $scope.goBack = function () {
            $ionicHistory.goBack();
        }

        $scope.videoId = $stateParams.livingEndedId;
        console.log('videoId: ' + $scope.videoId);

        //获取直播已结束的视频信息
        $http({
            method: 'POST',
            url: ApiEndpoint.url + 'live/liveAgainWatch.do',
            data: $.param({
                liveId: $scope.videoId
            }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function (data) {
            if (data.errorCode == 0) {
                $scope.livingEndedVideoInfo = data.result;
                console.log($scope.livingEndedVideoInfo.videoUrl);



                var myPlayer = neplayer('my-video', {}, function () {
                    console.log('播放器初始化完成');
                });
                var playerTech = videojs("my-video").tech({ IWillNotUseThisInPlugins: true });
                myPlayer.onPlayState(1, function () {
                    console.log('play');
                });
                myPlayer.onPlayState(2, function () {
                    console.log('pause');
                });
                myPlayer.onPlayState(3, function () { console.log('ended') });
                myPlayer.onError(function (data) { console.log(data) });


                myPlayer.setDataSource({ type: 'video/mp4', src: $scope.livingEndedVideoInfo.videoUrl });
                myPlayer.play();

                $scope.$on('$ionicView.beforeLeave', function () {
                    myPlayer.release();
                });

            }
        })





        // 收藏
        $scope.collection_flag = false;
        $scope.progress_collection = function () {
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'collect/collect.do',
                data: $.param({
                    userId: localStorage.userId,
                    collectedId: $scope.videoId,
                    //收藏类型type:1课程 2视频
                    type: 2
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    console.log('收藏成功');
                    $scope.collection_flag = true;
                } else if (data.errorCode == 23310) {
                    console.log('已经收藏过了,请不要重复收藏');
                    $scope.collection_flag = true;
                }
            })
        }

        // 点赞
        $scope.zan_flag = false;
        $scope.zan = function () {
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'video/addVideoEarnedNumber.do',
                data: $.param({
                    userId: localStorage.userId,
                    videoId: $scope.videoId
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    console.log('点赞成功');
                    $scope.zan_flag = true;
                } else if (data.errorCode == 202) {
                    console.log('已经点赞了');
                    $scope.zan_flag = true;
                }
            })
        }

        $('.progress_tab_change_selected').on('click', function () {
            $('.progress_tab_change_selected').removeClass('active1');
            $(this).addClass('active1');
            $('#progress_recorded_detail_content > div').css('display', 'none');
            switch ($(this).index()) {
                case 0: $('#progress_recorded_comment').css('display', 'block'); break;
                case 1: $('#progress_recorded_detail').css('display', 'block'); break;
                case 2: $('#progress_recorded_related').css('display', 'block'); break;

            }
        })


        /*
         * 判断登录用户付费状态
         *   selectType(查询类别):视频1 直播2 课程3 活动4
        */
        // 
        function isPayStatus(selectType, videoId, liveId, courseId, activityId) {
            console.log(localStorage.userId, selectType, videoId, liveId, courseId, activityId);
            $http.post(ApiEndpoint.url + "homePage/selectUserIsPayStatus.do", {}, {
                params: {
                    userId: localStorage.userId,
                    selectType: selectType,
                    videoId: videoId,
                    liveId: liveId,
                    courseId: courseId,
                    activityId: activityId
                }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    // isPay:(0:未付费),(>0:已付费)
                    if (data.result.isPay == 0) {
                        console.log('未付费');
                        $scope.videoPayStatus = 0;
                    } else if (data.result.isPay > 0) {
                        console.log('已付费');
                        $scope.videoPayStatus = 1;
                    }
                }
            })
        }
        isPayStatus(1, $scope.videoId, 0, 0, 0);

        // 用户评论课时
        $scope.videoComment = {};
        $scope.evaluate = function () {
            if ($scope.videoComment.evaluation == undefined || $scope.videoComment.evaluation == '') {
                PopService.showPop('评论不能为空');
            } else {
                $http({
                    method: 'POST',
                    url: ApiEndpoint.url + 'comment/addUserCommentLive.do',
                    data: $.param({
                        userId: localStorage.userId,
                        commentType: 2,/*评论类型:1直播 2视频 3课程*/
                        commentObjectId: $scope.videoId,
                        commentContent: $scope.videoComment.evaluation
                    }),
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                }).success(function (data) {
                    if (data.errorCode == 0) {
                        PopService.showPop('评论成功');
                        $scope.videoComment.evaluation = '';
                        getCommentList();
                    }
                })
            }
        }
        //获取用户评论
        function getCommentList() {
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'comment/getCommentList.do',
                data: $.param({
                    liveId: 0,
                    courseId: 0,
                    videoId: $scope.videoId,
                    //commentType:1直播 2视频 3课程
                    commentType: 2
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    $scope.commentList = data.result;
                }
            })
        }
        getCommentList();

        //获取录播详情--详情
        $http({
            method: 'POST',
            url: ApiEndpoint.url + 'comment/getVideoDetail.do',
            data: $.param({
                videoId: $scope.videoId
            }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function (data) {
            if (data.errorCode == 0) {
                $scope.videoDetail = data.result[0];
            }
        })

        //获取录播详情--相关
        $http({
            method: 'POST',
            url: ApiEndpoint.url + 'comment/getvideoRelevant.do',
            data: $.param({
                videoId: $scope.videoId
            }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function (data) {
            if (data.errorCode == 0) {
                $scope.videoRelevantList = data.result;
            }
        })


    })


    //忘记密码
    .controller('ForgetPasswordCtrl', function ($scope, $ionicLoading, $ionicActionSheet, $rootScope, $ionicHistory, $ionicPopup, $http, ApiEndpoint, $timeout, PopService) {
        // 获取验证码
        $scope.getCode1 = true;
        $scope.timer = 60;
        $scope.timerCode = function () {
            $timeout.cancel($scope.timer1);
            if ($scope.timer == 0) {
                $scope.getCode1 = true;
                $scope.timer = 60;
            } else {
                $scope.timer--;
                $scope.timer1 = $timeout(function () {
                    $scope.timerCode();
                }, 1000);
            }
        }
        $scope.registerData = { mobile: '', password: '', rpassword: '' }
        $scope.getCode = function () {
            $http.post(ApiEndpoint.url + 'user/genAuthCode.do', {}, {
                params: {
                    mobile: $scope.registerData.mobile,
                    type: 2
                }
            }).success(function (data) {

                if (data.errorCode == 0) {
                    $scope.code = data.result;
                    $scope.getCode1 = false;
                    $timeout.cancel($scope.timer2);
                    $scope.timer2 = $timeout(function () {
                        $scope.timerCode();
                    }, 1000);
                }
            })
        }
        $scope.submit = function () {
            if ($scope.code == undefined) {
                PopService.showPop("请先获取验证码");
            } else if ($scope.code != $scope.registerData.authcode) {
                PopService.showPop("验证码错误");
            } else {
                $http.post(ApiEndpoint.url + "user/messageLogin.do", {}, {
                    params: {
                        password: $scope.registerData.password,
                        rpassword: $scope.registerData.rpassword,
                        mobile: $scope.registerData.mobile,
                        authcode: $scope.registerData.authcode
                    }
                }).success(function (data) {
                    if (data.errorCode == 0) {
                        $scope.showPop('修改成功');
                        localStorage.user = JSON.stringify(data.result);
                        $state.go('login');
                    } else {
                        $scope.showError();
                    }
                })
            }
        }

        $scope.goBack = function () {
            $rootScope.$ionicGoBack()
        }
    })

    //充值记录
    .controller('RechangeRecordCtrl', function ($scope, $http, $ionicHistory, ApiEndpoint) {
        $scope.goBack = function () {
            $ionicHistory.goBack();
        }

        $http({
            method: 'POST',
            url: ApiEndpoint.url + 'record/getUserConsumption.do',
            data: $.param({
                userId: localStorage.userId
            }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function (data) {
            if (data.errorCode == 0) {
                $scope.consumptionList = data.result;
            }
        })
    })