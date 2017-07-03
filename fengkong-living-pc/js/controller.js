angular.module('fkliving.controller', ['fkliving.services'])

	.constant('ApiEndpoint', {
		// url: 'http://www.igmhz.com/fengkong-server/'
		url: 'http://localhost:8080/fengkong-server/'
	})

	// 登录注册
	.controller('LoginRegisterCtrl', ['$scope', '$http', '$rootScope','$interval','ApiEndpoint', function ($scope, $http, $rootScope,$interval,ApiEndpoint) {
		$(function () {
			$('.modal').modal();
		});

		// 登录
		$scope.user = {};

		$scope.login = function () {
			if (!$scope.user.userName) {
				Materialize.toast('用户名不能为空!', 3000);
				return false;
			} else if (!$scope.user.password) {
				Materialize.toast('密码不能为空!', 3000);
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
					if (data.errorCode == 0) {
						Materialize.toast('登录成功!', 3000);
						$('#modal').modal('close');

						localStorage.userId = data.result.userId;
						$rootScope.loginStatus = true;
					} else if (data.errorCode == 11311) {
						Materialize.toast('用户不存在!', 3000);
					} else {
						Materialize.toast('密码不正确!', 3000);
					}
				})
			}
		}


		// 注册
		$scope.registerData = {};
		$scope.codeStatus = false;
		$scope.time = 60;
		$scope.getCode = function(){
			if(/^1[34578]\d{9}$/.test($scope.registerData.mobile)){
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
	                    $scope.codeStatus = false;

	                    var timer = $interval(function(){
				                    	$scope.codeStatus = true;
				                		$scope.time--;

				                		if($scope.time == 0){
					                    	$interval.cancel(timer);
					                    	$scope.codeStatus = false;
					                    	$scope.time = 60;
					                    }
				                    },1000);
	                }
	            })
			}else{
				Materialize.toast('手机号格式不正确',3000);
			}
		}
		$scope.registerBtn = function(){
			/*if (!$scope.registerData.mobile) {
                Materialize.toast('手机号码不能为空',2000);
            } else if (!$scope.registerData.authcode) {
                Materialize.toast("验证码不能为空",2000);
            } else if (!$scope.registerData.password) {
                Materialize.toast("密码不能为空",2000);
            } else if (!$scope.registerData.rpassword) {
                Materialize.toast("重复密码不能为空",2000);
            } else if ($scope.registerData.password.length < 6) {
                Materialize.toast("密码位数不能小于6位",2000);
            } else if ($scope.registerData.rpassword != $scope.registerData.password) {
                Materialize.toast("两次输入的密码不一致",2000);
            } else {
                $http.post(ApiEndpoint.url + 'user/register.do', {}, {
                    params: {
                        mobile: $scope.registerData.mobile,
                        password: $scope.registerData.password,
                        authcode: $scope.registerData.authcode,
                        nickName: $scope.registerData.nickName
                    }
                }).success(function (data) {
                    if (data.errorCode == 0) {
                        localStorage.user = JSON.stringify(data.result);
                        localStorage.userId = data.result.userId;
                        localStorage.userName = data.result.userName;
                        localStorage.password = data.result.password;
                        Materialize.toast('注册成功，已登录');
                        $state.go('tabs.home');
                    } else {
                        Materialize.toast(data.errorMessage);
                    }
                })
            }*/
            if (!$scope.registerData.mobile) {
                Materialize.toast('手机号码不能为空',2000);
            } else if (!$scope.registerData.authcode) {
                Materialize.toast("验证码不能为空",2000);
            } else if (!$scope.registerData.password) {
                Materialize.toast("密码不能为空",2000);
            } else if ($scope.registerData.password.length < 6) {
                Materialize.toast("密码位数不能小于6位",2000);
            } else {
            	$http({
					method: 'POST',
					url: ApiEndpoint.url + 'user/register.do',
					data: $.param({
						mobile: $scope.registerData.mobile,
                        password: $scope.registerData.password,
                        authcode: $scope.registerData.authcode,
                        nickName: ''
					}),
					headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
				}).success(function (data) {
                    if (data.errorCode == 0) {
                        localStorage.userId = data.result.userId;
                        localStorage.userName = data.result.userName;
                        Materialize.toast('注册成功，已登录',2000);
                        $rootScope.loginStatus = true;
                 		$('#modal').modal('close');
                    } else {
                        Materialize.toast(data.errorMessage,2000);
                    }
                })
            }
		}
	}])
	.directive('loginRegister', function () {
		return {
			restrict: 'EA',
			// replace:true,
			templateUrl: 'templates/login.html',
			scope: '',
			link: function ($scope) {
				/*$scope.openModal = function(){
					$('#modal').modal('open');
				}*/
			}
		}
	})


	.controller('HeaderCtrl', ['$scope','$rootScope', function ($scope,$rootScope) {
		console.log(localStorage);
		if(localStorage.userId == undefined){
			$rootScope.loginStatus = false;
		}else if(localStorage.userId != undefined){
			$rootScope.loginStatus = true;
		}

		// 登录注册按钮
		var loginRegister = $('#loginRegister');
		var registerContent = loginRegister.find('.register');
		var loginContent = loginRegister.find('.login');

		var li = loginRegister.find('.title').children('li');
		li.on('click', function () {
			$(this).addClass("active").siblings().removeClass("active").parent().next().children('div').eq($(this).index()).show().siblings().hide();
		})
		// 登录注册模态框
		$scope.openRegisterModal = function () {
			$('#modal').modal('open');
			registerContent.show();
			loginContent.hide();
			loginRegister.find('.title').find('.navRegister').addClass('active');
			loginRegister.find('.title').find('.navLogin').removeClass('active');
		}
		$scope.openLoginModal = function () {
			$('#modal').modal('open');
			registerContent.hide();
			loginContent.show();
			loginRegister.find('.title').find('.navRegister').removeClass('active');
			loginRegister.find('.title').find('.navLogin').addClass('active');
		}

		// 个人中心按钮
		var personalCenterTitle = $('.headerIndex').find('.personal-center');
		var personalCenterMenu = $('.headerIndex').find('.personal-center').find('.down');
		personalCenterTitle.hover(function(){
			personalCenterMenu.stop().slideDown();
		},function(){
			personalCenterMenu.stop().slideUp();
		});
		// 退出登录
		$scope.loginOut = function(){
			localStorage.clear();
			$rootScope.loginStatus = false;
		}

	}])

	
	.controller('FooterCtrl', ['$scope', '$http', function ($scope, $http) {
		
	}])

	//首页
	.controller('IndexCtrl', ['$scope', '$http', '$timeout', 'ApiEndpoint', function ($scope, $http, $timeout, ApiEndpoint) {
		// activeIndex(导航栏定位)
		$scope.activeIndex = 1;

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
						// direction: 'horizontal',
						mode: 'horizontal',
						pagination: '.swiper-pagination-h',
						paginationClickable: true,
						// grabCursor: true,
						autoplay: 4000,
						loop: true
					})
				}, 0);
			}
		})

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
				var time = data.result;//获取时间戳


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

                                
                                //首页只展示4个
                                if ($scope.liveList.length > 4) {
                                    $scope.liveList.length = 4;
                                }

                            } else if (key == 'activityList') {
								$scope.activityList = data.result[key];

                                if ($scope.activityList.length > 4) {
                                    $scope.activityList.length = 4;
                                }

							} else if (key == 'courseList') {
								$scope.courseList = data.result[key];

								if ($scope.courseList.length > 4) {
									$scope.courseList.length = 4;
								}
							}
						})
					}
				})


			}
		})


        $scope.setType = function(id){
            var id = id;
            window.location.href = 'recorded.html?id=' + id;
        }

	}])

	//搜索
	.controller('SearchCtrl', ['$scope', '$http', 'ApiEndpoint', function ($scope, $http, ApiEndpoint) {

	}])

	
	//直播
	.controller('LivingCtrl', ['$scope', '$http','$timeout', 'ApiEndpoint', function ($scope, $http, $timeout,ApiEndpoint) {
		// activeIndex(导航栏定位)
		$scope.activeIndex = 3;

		//获取时间戳
		$http({
            method: 'POST',
            url: ApiEndpoint.url + 'home/getNowTime.do',
            data: $.param({}),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function (data) {
			if (data.errorCode == 0) {
				var time = data.result;


				//获取直播列表
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

						if($scope.livingList.length > 1){
							$timeout(function () {
								var mySwiper = new Swiper('.swiper-container', {
									// direction: 'horizontal',
									mode: 'horizontal',
									pagination: '.swiper-pagination-h',
									paginationClickable: true,
									// grabCursor: true,
									autoplay: 4000,
									loop: true,
									observer: true,//修改swiper自己或子元素时，自动初始化swiper
									observeParents: true,//修改swiper的父元素时，自动初始化swiper
								})
							}, 0);
						}else if($scope.livingList.length == 1){

						}
					}
				})
			}
		})



        /***********即将直播开始***********/

		/*
         *  enrollStatus(报名状态):0未报名  1已报名
         * 
         *  orderStatus(付费状态): 1未支付  2已支付
         *  即将直播的orderStatus可能为1或3,正在直播的orderStatus可能为1或2,已结束的orderStatus可能为1或2或3
         *  只有即将直播和正在直播无论免费还是收费都需先去报名来获取报名人数,直播已结束收费且未付费则直接进入确认订单页面
        */
        // 1.即将直播 点击'立即报名'
        $scope.beforeLivingApply = function(liveId,livePrice){
        	BeforeLivingInfo.info.liveId = liveId;
        	BeforeLivingInfo.info.livePrice = livePrice;

        	// 填写报名信息后提交
        	$('#beforeLivingApply').modal('open');
        	$scope.beforeLivingApplyInfo = {};
	        $scope.beforeLivingApplySubmit = function () {
	            $http({
	                method: 'POST',
	                url: ApiEndpoint.url + 'enroll/addEnroll.do',
	                data: $.param({
	                    userId: localStorage.userId,
	                    enrollName:$scope.beforeLivingApplyInfo.enrollName,
	                    mobile: $scope.beforeLivingApplyInfo.contactWay,
	                    company: $scope.beforeLivingApplyInfo.companyName,
	                    objectId: BeforeLivingInfo.info.liveId,
	                    enrollType: 1  //enrollType:1直播报名  2活动报名
	                }),
	                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	            }).success(function (data) {
	                if (data.errorCode == 0) {
	                    console.log(data.result);

	                    Materialize.toast('报名成功',3000);

	                    $('#beforeLivingApply').modal('close');

	                    // 即将直播确认订单
	                    $('#beforeLivingConfirmOrder').modal('open');
	                    $http({
				            method: 'POST',
				            url: ApiEndpoint.url + 'enroll/sureEnroll.do',
				            data: $.param({
				                userId: localStorage.userId,
				                ObjectId: BeforeLivingInfo.info.liveId,
				                enrollType: 1  //enrollType:1直播报名  2活动报名
				            }),
				            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
				        }).success(function (data) {
				            if (data.errorCode == 0) {
				                $scope.beforeLivingConfirmOrderInfo = data.result;
				                console.log(data.result);

				                // 点击确认订单'确认'后进入选择支付方式
				                $scope.beforeLivingConfirmOrderSubmit = function(){
				                	$('#beforeLivingConfirmOrder').modal('close');

				                	// 即将直播选择支付方式
						            $('#beforeLivingSelectPayType').modal('open');
				                }
				            }
				        })
	                }
	            })
	        }
        }


        // 2.即将直播  点击'已报名'后判断
        $scope.beforeLivingApplyed = function (liveId, liveName, livePrice, orderStatus) {
        	BeforeLivingInfo.info.liveId = liveId;
        	BeforeLivingInfo.info.livePrice = livePrice;

        	// 即将直播已报名但未付费
        	if(orderStatus == 1){
	        	// 即将直播确认订单
	            $('#beforeLivingConfirmOrder').modal('open');
	            $http({
		            method: 'POST',
		            url: ApiEndpoint.url + 'enroll/sureEnroll.do',
		            data: $.param({
		                userId: localStorage.userId,
		                ObjectId: BeforeLivingInfo.info.liveId,
		                enrollType: 1  //enrollType:1直播报名  2活动报名
		            }),
		            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
		        }).success(function (data) {
		            if (data.errorCode == 0) {
		                $scope.beforeLivingConfirmOrderInfo = data.result;

		                // 点击确认订单'确认'后进入选择支付方式
		                $scope.beforeLivingConfirmOrderSubmit = function(){
		                	$('#beforeLivingConfirmOrder').modal('close');

		                	// 即将直播选择支付方式
				            $('#beforeLivingSelectPayType').modal('open');
		                }
		            }
		        })
		    }
		    // 即将直播已报名且已支付
		    else if(orderStatus == 2){
            	window.location.href = 'livingDetail.html?liveId='+liveId;
		    }

        }


        
        // 即将直播选择支付方式--余额支付
        $scope.balancePay = function(){
        	// 获取orderId进行下单
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'order/generateOrder.do',
                data: $.param({
                    userId: localStorage.userId,
                    liveId: BeforeLivingInfo.info.liveId,
                    orderTurnover: BeforeLivingInfo.info.livePrice,
                    orderName: '风控币下单',
                    orderType: 3 // orderType:1入场券支付  2线下支付  3 余额支付  4微信支付  5支付宝支付
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    Materialize.toast('下单成功',3000);

                    var orderInfo = {};
                    var orderInfo = data.result;

                    console.log('orderId: ' + orderInfo.orderId);

                    window.location.href = 'balancePay.html?orderId='+orderInfo.orderId+'&orderCode='+orderInfo.orderCode+'&orderTurnover='+orderInfo.orderTurnover+'&description='+orderInfo.description;
                } else {
                    Materialize.toast('下单失败',3000);
                }
            })
        }


        // 即将直播选择支付方式--微信支付
        $scope.wechatPay = function () {
            // 获取orderId进行下单
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'order/generateOrder.do',
                data: $.param({
                    userId: localStorage.userId,
                    liveId: BeforeLivingInfo.info.liveId,
                    orderTurnover: BeforeLivingInfo.info.livePrice,
                    orderName: '微信下单',
                    orderType: 4 // orderType:1入场券支付  2线下支付  3 余额支付  4微信支付  5支付宝支付
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    var orderInfo = {};
                    var orderInfo = data.result;

                    console.log('orderId: ' + orderInfo.orderId);

                    window.location.href = 'wechatPay.html?orderId='+orderInfo.orderId+'&orderCode='+orderInfo.orderCode+'&orderTurnover='+orderInfo.orderTurnover+'&description='+orderInfo.description;
                }
            })
        }


        /***********即将直播结束***********/


	}])


	//直播详情页
	.controller('LivingDetailCtrl', ['$scope', '$http', 'ApiEndpoint', 'GetParams', function ($scope, $http, ApiEndpoint, GetParams) {
		// activeIndex(导航栏定位)
		$scope.activeIndex = 3;

		var urlParams = new GetParams.UrlSearch();
		var liveId = urlParams.liveId;
		var activityId = urlParams.activityId;
		

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
                    "poster": data.result.liveIcon, //视频播放前显示的图片
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
				}, function () {
					console.log('播放器初始化完成');
				});
				// var playerTech = videojs("my-video").tech({ IWillNotUseThisInPlugins: true });
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
	                // data.result:0未点赞  1已点赞
	                if(data.result == 0){
	                    $scope.zan_flag = false;
	                }else if(data.result == 1){
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
                    Materialize.toast('点赞成功',3000);
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
                    Materialize.toast('取消点赞成功',3000);
                    $scope.zan_flag = false;

                    getLiveEarnInfo();
                }else{
                    Materialize.toast(data.errorMessage,3000);
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
                Materialize.toast('评论不能为空',3000);
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
                        Materialize.toast('评论成功',3000);
                        $scope.living.evaluation = '';
                        getCommentList();
                    }
                })
            }
        }


	}])


	//录播
	.controller('RecordedCtrl', ['$scope', '$http', 'ApiEndpoint','GetParams', function ($scope, $http, ApiEndpoint,GetParams) {
		// activeIndex(导航栏定位)
		$scope.activeIndex = 2;


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
                    $scope.filteredCourses = data.result;

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
        getAllCourses();

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
                    $scope.filteredVideos = data.result;

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


		// 类别
		$scope.toggleType = function (typeId) {
            $scope.filterStatus = true;

            $scope.typeId = typeId;

			switch (typeId) {
				case 1:
					$scope.typeName = '内控';
					break;
				case 2:
					$scope.typeName = '审计';
					break;
				case 3:
					$scope.typeName = '财务';
					break;
				case 4:
					$scope.typeName = '税务';
					break;
				case 5:
					$scope.typeName = '风控';
					break;
				case 0:
                    $scope.typeName = '类别';
			}


            // 通过类型筛选课程
            getAllCourses();

			// 通过类型筛选视频
			getAllVideos();
		}


		// 价格
		$scope.togglePrice = function (priceId) {
            $scope.filterStatus = true;

            $scope.priceId = priceId;

			switch (priceId) {
				case 0:
					$scope.priceName = '免费';
					break;
				case 1:
					$scope.priceName = '收费';
					break;
				case 2:
                    $scope.priceName = '价格';
			}


            // 通过价格筛选课程
            getAllCourses();

            // 通过价格筛选视频
            getAllVideos();
		}

        // 课程、视频切换(切换同时初始化类别和价格)
		$scope.course2videoId = 1;//默认显示课程
		$scope.toggleCourseAndVideo = function (id) {
            $scope.filterStatus = false;

			$scope.course2videoId = id;
			console.log($scope.course2videoId);

			$scope.typeName = '';
			$scope.priceName = '';

			if (id == 1) {
				$scope.course2video = '课程';

				$scope.typeId = 0;
				$scope.priceId = 2;
				getAllCourses();
			} else if (id == 2) {
				$scope.course2video = '视频';

				$scope.typeId = 0;
				$scope.priceId = 2;
				getAllVideos();
			}
		}


        var urlParams = new GetParams.UrlSearch()
        var homeBtn = urlParams.id;

        if(homeBtn == ''){
            $scope.selectedLivingRecorded = 1;//显示直播
        }else if(homeBtn != ''){
            
            if (homeBtn == 0) {//点击首页的推荐课程的'更多'过来的,需要显示录播
                // $scope.selectedLivingRecorded = 2;//显示录播
                getAllCourses();
            }else if(homeBtn == 1){
                // 点击首页'内控'跳转至录播对应'内控筛选'课程
                // $scope.selectedLivingRecorded = 2;
                // $scope.typeData.typeId = 1;
                $scope.typeName = '内控';
                $scope.toggleType(1);
            }else if(homeBtn == 2){
                // 点击首页'审计'跳转至录播对应'审计筛选'课程
                // $scope.selectedLivingRecorded = 2;
                // $scope.typeData.typeId = 2;
                $scope.typeName = '审计';
                $scope.toggleType(2);
            }else if(homeBtn == 3){
                // 点击首页'财务'跳转至录播对应'财务筛选'课程
                // $scope.selectedLivingRecorded = 2;
                // $scope.typeData.typeId = 3;
                $scope.typeName = '财务';
                $scope.toggleType(3);
            }else if(homeBtn == 4){
                // 点击首页'税务'跳转至录播对应'税务筛选'课程
                // $scope.selectedLivingRecorded = 2;
                // $scope.typeData.typeId = 4;
                $scope.typeName = '税务';
                $scope.toggleType(4);
            }else if(homeBtn == 5){
                // 点击首页'风控'跳转至录播对应'风控筛选'课程
                // $scope.selectedLivingRecorded = 2;
                // $scope.typeData.typeId = 5;
                $scope.typeName = '风控';
                $scope.toggleType(5);
            }

        }

	}])

	//录播课程列表
	.controller('RecordedCourseDetailCtrl', ['$scope', '$http', 'ApiEndpoint', 'GetParams',function ($scope, $http, ApiEndpoint,GetParams) {
		// activeIndex(导航栏定位)
		$scope.activeIndex = 2;

		var urlParams = new GetParams.UrlSearch();
		$scope.courseId = urlParams.courseId;


		$scope.currentCourseCollectPeople = 0;//课程收藏人数
        $scope.currentCourseEarnedPeople = 0;//课程点赞人数
		// 获取用户的课程信息(包含收藏点赞状态)
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
        $scope.courseCollection = function () {
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
                    Materialize.toast('收藏成功',3000);
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
                    Materialize.toast('取消收藏成功',3000);
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
                    Materialize.toast('点赞成功',3000);
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
                    Materialize.toast('取消点赞成功',3000);
                    $scope.zan_flag = false;

                    getCourseCollectAndEarnInfo();
                }
            })
        }


        //课程详情
        $scope.getCourseDetail = function () {
        	$http({
                method: 'POST',
                url: ApiEndpoint.url + 'course/getCourseDetail.do',
                data: $.param({
                    courseId: $scope.courseId
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    $scope.courseDetail = data.result;
                }
            })
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
        // 用户评论课程
        $scope.recordList = {};
        $scope.evaluate = function () {
            if ($scope.recordList.evaluation == undefined || $scope.recordList.evaluation == '') {
                Materialize.toast('评论不能为空',3000);
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
                        Materialize.toast('评论成功',3000);
                        $scope.recordList.evaluation = '';
                        getCommentList();
                    }
                })
            }
        }
        


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


        $scope.createCourseOrder = function () {
            alert(1)
        }




	}])

	//视频
	.controller('VideoCtrl', ['$scope', '$http', 'ApiEndpoint','GetParams', function ($scope, $http, ApiEndpoint,GetParams) {
		// activeIndex(导航栏定位)
		// $scope.activeIndex = 4;

		var urlParams = new GetParams.UrlSearch();
		$scope.videoId = urlParams.videoId;

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



        //获取视频详情--详情
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
                                    $scope.videoInfo = data.result;
                                    console.log(videoResult);
                                    
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

                                            console.log(courseIsPay);//undefined #####################################这里有坑，取不到值，坑坑坑坑坑坑坑坑坑坑啊啊啊啊啊
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
        $scope.videoCollection = function () {
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
                    Materialize.toast('收藏成功',3000);
                    $scope.collection_flag = true;
                } else if (data.errorCode == 23310) {
                    Materialize.toast('已经收藏过了,请不要重复收藏',3000);
                    $scope.collection_flag = true;
                }

                getVideoCollectAndEarned();
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
                    Materialize.toast('取消收藏成功',3000);
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
                    Materialize.toast('点赞成功',3000);
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
                    Materialize.toast('取消点赞成功',3000);
                    $scope.zan_flag = false;

                    getVideoCollectAndEarned();
                }
            })
        }



        // 添加用户评论
        $scope.videoComment = {};
        $scope.evaluate = function () {
            if ($scope.videoComment.evaluation == undefined || $scope.videoComment.evaluation == '') {
                Materialize.toast('评论内容不能为空',3000);
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
                        Materialize.toast('评论成功',3000);
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


        $scope.createCourseVideoOrder = function(){
            $('#createCourseVideoOrder').modal('open');

            // 购买视频
            $scope.hasCourse = false;
            $scope.courseVideoConfirmOrderInfo = {};
            $scope.buyCourseVideo = function(){
                $http({
                    method: 'POST',
                    url: ApiEndpoint.url + 'video/getCourseIdByVideo.do',//根据videoId获取是否有courseId
                    data: $.param({
                        videoId: $scope.videoId
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
                                    $scope.courseVideoConfirmOrderInfo.courseName = data.result.course.courseName;
                                }
                            })
                        }
                    }
                })



                $http({
                    method: 'POST',
                    url: ApiEndpoint.url + 'video/getVideoById.do',
                    data: $.param({
                        videoId: $scope.videoId
                    }),
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                }).success(function(data){
                    if(data.errorCode == 0){
                        console.log(data.result);
                        $scope.courseVideoConfirmOrderInfo.videoName = data.result.videoName;
                        $scope.courseVideoConfirmOrderInfo.videoPrice = data.result.videoPrice;

                        //获取orderId
                        $http({
                            method: 'POST',
                            url: ApiEndpoint.url + 'order/generateOrder.do',
                            data: $.param({
                                userId: localStorage.userId,
                                videoId: $scope.videoId,
                                orderTurnover: $scope.courseVideoConfirmOrderInfo.videoPrice
                            }),
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                        }).success(function (data) {
                            if (data.errorCode == 0) {
                                $scope.orderId = data.result.orderId;
                            }
                        })
                    }
                })
            }
        }



	}])

	//活动
	.controller('ActivityCtrl', ['$scope', '$http', '$timeout','ApiEndpoint','GetParams', function ($scope, $http, $timeout,ApiEndpoint,GetParams) {
		// activeIndex(导航栏定位)
		$scope.activeIndex = 4;


        // 全部
        $scope.all = function(activityWay){
        	$scope.activityWay = activityWay;

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

                            // newActivityStatus(活动状态):1即将开始(报名中)  2正在进行  3已结束

                            // 只有'全部'有'推荐活动',其余3个(特训营、公开课、线上沙龙)没有推荐活动使用瀑布式展示;'全部'的'近期活动'不包含已结束的活动并且优先放正在直播然后放即将直播
                            $scope.recommendedActivityList = [];//推荐活动--作为'全部'的轮播图
                            $scope.recentActivityLiving = [];//近期活动--正在直播
                            $scope.recentActivityBeforeLiving = [];//近期活动--即将直播

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

                            console.log($scope.recentActivityLiving);
                            console.log($scope.recentActivityBeforeLiving);
                            
                            
                            /*$timeout(function () {
                                var swiperContainerActivity = new Swiper('#swiper-container-activity', {
                                    autoplay: 4000,
                                    loop: true,
                                    pagination: '.swiper-pagination',
                                    observer: true,//修改swiper自己或子元素时，自动初始化swiper
                                    observeParents: true,//修改swiper的父元素时，自动初始化swiper
                                });
                            }, 0)*/
                            


                            /*angular.forEach($scope.activityList, function (value) {
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
                            })*/

                        }
                    })
                }
            })
        }
        $scope.all(0);// 页面初始化默认显示'全部'

        // 特训营、公开课
        $scope.setActivityWay = function (activityWay) {
            $scope.activityWay = activityWay;

            
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

                            // newActivityStatus(活动状态):1即将开始(报名中)  2正在进行  3已结束
                            angular.forEach($scope.activityList, function (value) {
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
                            })

                        }
                    })
                }
            })
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
                        }
                    })
                }
            })
        }

        var urlParams = new GetParams.UrlSearch();
		if(urlParams.more == 1){
			$scope.onlineSalon(3);
		}

	}])

	// 线下活动详情(包括特训营和公开课)
	.controller('ActivityDetailCtrl',['$scope', '$http', 'ApiEndpoint','GetParams', function ($scope, $http, ApiEndpoint,GetParams){
		// activeIndex(导航栏定位)
		$scope.activeIndex = 4;

		var urlParams = new GetParams.UrlSearch();
		$scope.activityId = urlParams.activityId;

		/*// 未报名
        $scope.notEnroll = false;
        // 已报名但未支付
        $scope.enrolled = false;
        // 已结束但未支付
        $scope.notPayEndedActivity = false;*/


        // 即将直播、正在直播报名状态livingEnrollStatus：false未报名  true已报名
        $scope.livingEnrollStatus = false;
        // 即将直播、正在直播支付状态livingPayStatus：false未支付  true已支付
        $scope.livingPayStatus = false;
        /*// 线下已结束活动支付状态
        $scope.endedAtivityStatus = false;*/


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
                        $('#j-activityDetail').html(activityDescription);


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
                            // 正在进行
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
                                // total:1已支付  未支付
                                $scope.activityPayStatus = data.total;
                                

                                // (线下活动)即将进行 未报名
                                if($scope.activityInfo.newActivityStatus == 1 && $scope.activityEnroll == 0){
                                    $scope.livingEnrollStatus = false;
                                }
                                // (线下活动)即将进行 已报名但未支付
                                else if($scope.activityInfo.newActivityStatus == 1 && $scope.activityEnroll == 1 && $scope.activityPayStatus == 2){
                                    $scope.livingEnrollStatus = true;
                                    $scope.livingPayStatus = false;
                                }
                                // (线下活动)即将进行 已报名且已支付
                                else if($scope.activityInfo.newActivityStatus == 1 && $scope.activityEnroll == 1 && $scope.activityPayStatus == 1){
                                    $scope.livingEnrollStatus = true;
                                    $scope.livingPayStatus = true;
                                }


                                // (线下活动)正在进行 未报名
                                if($scope.activityInfo.newActivityStatus == 2 && $scope.activityEnroll == 0){
                                    $scope.livingEnrollStatus = false;
                                }
                                // (线下活动)正在进行 已报名但未支付
                                else if($scope.activityInfo.newActivityStatus == 2 && $scope.activityEnroll == 1 && $scope.activityPayStatus == 2){
                                    $scope.livingEnrollStatus = true;
                                    $scope.livingPayStatus = false;
                                }
                                // (线下活动)正在进行 已报名且已支付
                                else if($scope.activityInfo.newActivityStatus == 2 && $scope.activityEnroll == 1 && $scope.activityPayStatus == 1){
                                    $scope.livingEnrollStatus = true;
                                    $scope.livingPayStatus = true;
                                }


                                /*// (线下活动)已结束 未支付
                                if($scope.activityInfo.newActivityStatus == 3 && $scope.activityPayStatus == 2){
                                    $scope.endedAtivityStatus = false;
                                }
                                // (线下活动)已结束 已支付
                                else if($scope.activityInfo.newActivityStatus == 3 && $scope.activityPayStatus == 1){
                                    $scope.endedAtivityStatus = true;
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


		
        // 1.即将进行和正在进行  点击'立即报名'
        $scope.livingApply = function(){
        	// 填写报名信息后提交
        	$('#livingApply').modal('open');
        	$scope.livingApplyInfo = {};
	        $scope.livingApplySubmit = function () {
	            $http({
	                method: 'POST',
	                url: ApiEndpoint.url + 'enroll/addEnroll.do',
	                data: $.param({
	                    userId: localStorage.userId,
	                    enrollName:$scope.livingApplyInfo.enrollName,
	                    mobile: $scope.livingApplyInfo.contactWay,
	                    company: $scope.livingApplyInfo.companyName,
	                    objectId: $scope.activityId,
	                    enrollType: 2  //enrollType:1直播报名  2活动报名
	                }),
	                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	            }).success(function (data) {
	                if (data.errorCode == 0) {
	                    Materialize.toast('报名成功',3000);

	                    getSalonInfo();//更新报名状态

	                    $('#livingApply').modal('close');

	                    // 即将进行和正在进行  确认订单
	                    $('#livingConfirmOrder').modal('open');
	                    $http({
				            method: 'POST',
				            url: ApiEndpoint.url + 'enroll/sureEnroll.do',
				            data: $.param({
				                userId: localStorage.userId,
				                ObjectId: $scope.activityId,
				                enrollType: 2  //enrollType:1直播报名  2活动报名
				            }),
				            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
				        }).success(function (data) {
				            if (data.errorCode == 0) {
				                $scope.livingConfirmOrderInfo = data.result;

				                // 点击确认订单'确认'后进入选择支付方式
				                $scope.livingConfirmOrderSubmit = function(){
				                	$('#livingConfirmOrder').modal('close');

				                	// 即将直播选择支付方式
						            $('#livingSelectPayType').modal('open');
				                }
				            }
				        })
	                }
	            })
	        }
        }

        // 2.即将进行和正在进行  点击'去支付'后判断
        $scope.livingApplyed = function () {
        	// 即将进行和正在进行 已报名但未支付
        	if($scope.activityPayStatus == 2){
	        	// 即将进行和正在进行 确认订单
	            $('#livingConfirmOrder').modal('open');
	            $http({
		            method: 'POST',
		            url: ApiEndpoint.url + 'enroll/sureEnroll.do',
		            data: $.param({
		                userId: localStorage.userId,
		                ObjectId: $scope.activityId,
		                enrollType: 2  //enrollType:1直播报名  2活动报名
		            }),
		            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
		        }).success(function (data) {
		            if (data.errorCode == 0) {
		                $scope.livingConfirmOrderInfo = data.result;

		                // 点击确认订单'确认'后进入选择支付方式
		                $scope.livingConfirmOrderSubmit = function(){
		                	$('#livingConfirmOrder').modal('close');

		                	// 选择支付方式
				            $('#livingSelectPayType').modal('open');
		                }
		            }
		        })
		    }
		    // 即将进行和正在进行 已报名且已支付
		    else if($scope.activityPayStatus == 1){
            	// window.location.href = 'livingDetail.html?liveId='+$scope.;
            	Materialize.toast('已支付',3000);
		    }
        }

        // 3.线下活动已结束(未支付)  点击'去支付'后判断
        $scope.endedActivityNotPay = function(){
            $('#endedActivityNotPayConfirmOrder').modal('open');
            
            $scope.endedActivityNotPayConfirmOrderSubmit = function(){
                $('#endedActivityNotPayConfirmOrder').modal('close');

                // 选择支付方式
                $('#livingSelectPayType').modal('open');
            }
        }



        // 选择支付方式--余额
        $scope.balancePay = function(){
        	// 获取orderId进行下单
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'order/generateOrder.do',
                data: $.param({
                    userId: localStorage.userId,
                    activityId: $scope.activityId,
                    orderTurnover: $scope.activityInfo.activityPrice,
                    orderName: '风控币下单',
                    orderType: 3 // orderType:1入场券支付  2线下支付  3 余额支付  4微信支付  5支付宝支付
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    Materialize.toast('下单成功',3000);

                    var orderInfo = {};
                    var orderInfo = data.result;

                    window.location.href = 'balancePay.html?orderId='+orderInfo.orderId+'&orderCode='+orderInfo.orderCode+'&orderTurnover='+orderInfo.orderTurnover+'&description='+orderInfo.description;
                } else {
                    Materialize.toast('下单失败',3000);
                }
            })
        }
        // 选择支付方式--微信
        $scope.wechatPay = function () {
            // 获取orderId进行下单
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'order/generateOrder.do',
                data: $.param({
                    userId: localStorage.userId,
                    activityId: $scope.activityId,
                    orderTurnover: $scope.activityInfo.activityPrice,
                    orderName: '微信下单',
                    orderType: 4 // orderType:1入场券支付  2线下支付  3 余额支付  4微信支付  5支付宝支付
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    var orderInfo = {};
                    var orderInfo = data.result;

                    window.location.href = 'wechatPay.html?orderId='+orderInfo.orderId+'&orderCode='+orderInfo.orderCode+'&orderTurnover='+orderInfo.orderTurnover+'&description='+orderInfo.description;
                }
            })
        }
        //选择支付方式--支付宝
        $scope.aliPay = function () {
            // 获取orderId进行下单
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'order/generateOrder.do',
                data: $.param({
                    userId: localStorage.userId,
                    activityId: $scope.activityId,
                    orderTurnover: $scope.activityInfo.activityPrice,
                    orderName: '支付宝下单',
                    orderType: 5 // orderType:1入场券支付  2线下支付  3 余额支付  4微信支付  5支付宝支付
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    Materialize.toast('下单成功',3000);

                    var orderInfo = {};
                    var orderInfo = data.result;

                    window.location.href = 'aliPay.html?orderId='+orderInfo.orderId+'&orderCode='+orderInfo.orderCode+'&orderTurnover='+orderInfo.orderTurnover+'&description='+orderInfo.description;
                } else {
                    Materialize.toast('下单失败',3000);
                }
            })
        }
        //选择支付方式--体验券
        $scope.couponPay = function () {
            // 获取orderId进行下单
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'order/generateOrder.do',
                data: $.param({
                    userId: localStorage.userId,
                    activityId: $scope.activityId,
                    orderTurnover: $scope.activityInfo.activityPrice,
                    orderName: '体验券下单',
                    orderType: 1 // orderType:1体验券支付  2线下支付  3 余额支付  4微信支付  5支付宝支付
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    var orderInfo = {};
                    var orderInfo = data.result;

                    /*$state.go('change_coupon', {
                        orderId: orderInfo.orderId
                    });*/
                    window.location.href = 'couponPay.html?orderId='+orderInfo.orderId+'&orderCode='+orderInfo.orderCode+'&orderTurnover='+orderInfo.orderTurnover+'&description='+orderInfo.description;
                }
            })
        }






	}])

	/*.directive('beforeLivingApply', function (){
		return {
			restrict:'EA',
			scope:{
				open:'&'
			}
			templateUrl:'templates/beforeLivingApply.html',
			link:function(scope,element,attrs){
				$scope.open = function(){
		        	alert(111);
		        	// 填写报名信息后提交
		        	$('#beforeLivingApply').modal('open');

		        }
			}
		}
	})*/

	// 活动--线上沙龙详情
	.controller('SalonCtrl',['$scope', '$http', 'ApiEndpoint','GetParams', function ($scope, $http, ApiEndpoint,GetParams){
		// activeIndex(导航栏定位)
		$scope.activeIndex = 4;

		var urlParams = new GetParams.UrlSearch();
		$scope.activityId = urlParams.activityId;
		$scope.liveId = urlParams.liveId;
		console.log($scope.activityId,$scope.liveId);


        // 即将直播、正在直播报名状态livingEnrollStatus：false未报名  true已报名
        $scope.livingEnrollStatus = false;
        // 即将直播、正在直播支付状态livingPayStatus：false未支付  true已支付
        $scope.livingPayStatus = false;
        


        function getSalonInfo(){
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
	                        $('#j-activityDetail').html(activityDescription);


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
	                                // total:1已支付  未支付
	                                $scope.activityPayStatus = data.total;
	                                

	                                // 即将直播 未报名
	                                if($scope.activityInfo.newActivityStatus == 1 && $scope.activityEnroll == 0){
	                                    $scope.livingEnrollStatus = false;
	                                }
	                                // 即将直播 已报名但未支付
	                                else if($scope.activityInfo.newActivityStatus == 1 && $scope.activityEnroll == 1 && $scope.activityPayStatus == 2){
	                                    $scope.livingEnrollStatus = true;
	                                    $scope.livingPayStatus = false;
	                                }
	                                // 即将直播 已报名且已支付
	                                else if($scope.activityInfo.newActivityStatus == 1 && $scope.activityEnroll == 1 && $scope.activityPayStatus == 1){
	                                    $scope.livingEnrollStatus = true;
	                                    $scope.livingPayStatus = true;
	                                }


	                                // 即将直播、正在直播 未报名
	                                if($scope.activityInfo.newActivityStatus == 2 && $scope.activityEnroll == 0){
	                                    $scope.livingEnrollStatus = false;
	                                }
	                                // 即将直播、正在直播 已报名但未支付
	                                else if($scope.activityInfo.newActivityStatus == 2 && $scope.activityEnroll == 1 && $scope.activityPayStatus == 2){
	                                    $scope.livingEnrollStatus = true;
	                                    $scope.livingPayStatus = false;
	                                }
	                                // 即将直播、正在直播 已报名且已支付
	                                else if($scope.activityInfo.newActivityStatus == 2 && $scope.activityEnroll == 1 && $scope.activityPayStatus == 1){
	                                    $scope.livingEnrollStatus = true;
	                                    $scope.livingPayStatus = true;
	                                }

	                            }
	                        })
	                    }
	                })
	            }
	        })
		}
		getSalonInfo();


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




        // 1.即将直播 点击'立即报名'
        $scope.livingApply = function(){
        	// 填写报名信息后提交
        	$('#livingApply').modal('open');
        	$scope.livingApplyInfo = {};
	        $scope.livingApplySubmit = function () {
	            $http({
	                method: 'POST',
	                url: ApiEndpoint.url + 'enroll/addEnroll.do',
	                data: $.param({
	                    userId: localStorage.userId,
	                    enrollName:$scope.livingApplyInfo.enrollName,
	                    mobile: $scope.livingApplyInfo.contactWay,
	                    company: $scope.livingApplyInfo.companyName,
	                    objectId: $scope.activityId,
	                    enrollType: 2  //enrollType:1直播报名  2活动报名
	                }),
	                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	            }).success(function (data) {
	                if (data.errorCode == 0) {
	                    Materialize.toast('报名成功',3000);

	                    getSalonInfo();//更新报名状态

	                    $('#livingApply').modal('close');

	                    // 即将直播确认订单
	                    $('#livingConfirmOrder').modal('open');
	                    $http({
				            method: 'POST',
				            url: ApiEndpoint.url + 'enroll/sureEnroll.do',
				            data: $.param({
				                userId: localStorage.userId,
				                ObjectId: $scope.activityId,
				                enrollType: 2  //enrollType:1直播报名  2活动报名
				            }),
				            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
				        }).success(function (data) {
				            if (data.errorCode == 0) {
				                $scope.livingConfirmOrderInfo = data.result;

				                // 点击确认订单'确认'后进入选择支付方式
				                $scope.livingConfirmOrderSubmit = function(){
				                	$('#livingConfirmOrder').modal('close');

				                	// 即将直播选择支付方式
						            $('#livingSelectPayType').modal('open');
				                }
				            }
				        })
	                }
	            })
	        }
        }

        // 2.即将直播  点击'去支付'后判断
        $scope.livingApplyed = function () {
        	// 即将直播已报名但未支付
        	if($scope.activityPayStatus == 2){
	        	// 即将直播确认订单
	            $('#livingConfirmOrder').modal('open');
	            $http({
		            method: 'POST',
		            url: ApiEndpoint.url + 'enroll/sureEnroll.do',
		            data: $.param({
		                userId: localStorage.userId,
		                ObjectId: $scope.activityId,
		                enrollType: 2  //enrollType:1直播报名  2活动报名
		            }),
		            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
		        }).success(function (data) {
		            if (data.errorCode == 0) {
		                $scope.livingConfirmOrderInfo = data.result;

		                // 点击确认订单'确认'后进入选择支付方式
		                $scope.livingConfirmOrderSubmit = function(){
		                	$('#livingConfirmOrder').modal('close');

		                	// 即将直播选择支付方式
				            $('#livingSelectPayType').modal('open');
		                }
		            }
		        })
		    }
		    // 即将直播已报名且已支付
		    else if($scope.activityPayStatus == 1){
            	// window.location.href = 'livingDetail.html?liveId='+$scope.;
            	Materialize.toast('已支付',3000);
		    }
        }


        // 即将直播选择支付方式--余额支付
        $scope.balancePay = function(){
        	// 获取orderId进行下单
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'order/generateOrder.do',
                data: $.param({
                    userId: localStorage.userId,
                    activityId: $scope.activityId,
                    orderTurnover: $scope.activityInfo.activityPrice,
                    orderName: '风控币下单',
                    orderType: 3 // orderType:1入场券支付  2线下支付  3 余额支付  4微信支付  5支付宝支付
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    Materialize.toast('下单成功',3000);

                    var orderInfo = {};
                    var orderInfo = data.result;

                    window.location.href = 'balancePay.html?orderId='+orderInfo.orderId+'&orderCode='+orderInfo.orderCode+'&orderTurnover='+orderInfo.orderTurnover+'&description='+orderInfo.description;
                } else {
                    Materialize.toast('下单失败',3000);
                }
            })
        }
        // 即将直播选择支付方式--微信支付
        $scope.wechatPay = function () {
            // 获取orderId进行下单
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'order/generateOrder.do',
                data: $.param({
                    userId: localStorage.userId,
                    activityId: $scope.activityId,
                    orderTurnover: $scope.activityInfo.activityPrice,
                    orderName: '微信下单',
                    orderType: 4 // orderType:1入场券支付  2线下支付  3 余额支付  4微信支付  5支付宝支付
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    var orderInfo = {};
                    var orderInfo = data.result;

                    window.location.href = 'wechatPay.html?orderId='+orderInfo.orderId+'&orderCode='+orderInfo.orderCode+'&orderTurnover='+orderInfo.orderTurnover+'&description='+orderInfo.description;
                }
            })
        }
        //即将直播选择支付方式--支付宝支付
        $scope.aliPay = function () {
            // 获取orderId进行下单
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'order/generateOrder.do',
                data: $.param({
                    userId: localStorage.userId,
                    activityId: $scope.activityId,
                    orderTurnover: $scope.activityInfo.activityPrice,
                    orderName: '支付宝下单',
                    orderType: 5 // orderType:1入场券支付  2线下支付  3 余额支付  4微信支付  5支付宝支付
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    Materialize.toast('下单成功',3000);

                    var orderInfo = {};
                    var orderInfo = data.result;

                    window.location.href = 'aliPay.html?orderId='+orderInfo.orderId+'&orderCode='+orderInfo.orderCode+'&orderTurnover='+orderInfo.orderTurnover+'&description='+orderInfo.description;
                } else {
                    Materialize.toast('下单失败',3000);
                }
            })
        }
        //即将直播选择支付方式--体验券支付
        $scope.couponPay = function () {
            // 获取orderId进行下单
            $http({
                method: 'POST',
                url: ApiEndpoint.url + 'order/generateOrder.do',
                data: $.param({
                    userId: localStorage.userId,
                    activityId: $scope.activityId,
                    orderTurnover: $scope.activityInfo.activityPrice,
                    orderName: '体验券下单',
                    orderType: 1 // orderType:1体验券支付  2线下支付  3 余额支付  4微信支付  5支付宝支付
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (data) {
                if (data.errorCode == 0) {
                    var orderInfo = {};
                    var orderInfo = data.result;

                    /*$state.go('change_coupon', {
                        orderId: orderInfo.orderId
                    });*/
                    window.location.href = 'couponPay.html?orderId='+orderInfo.orderId+'&orderCode='+orderInfo.orderCode+'&orderTurnover='+orderInfo.orderTurnover+'&description='+orderInfo.description;
                }
            })
        }
		
	}])

	//余额支付
	.controller('BalancePayCtrl', ['$scope', '$http','$timeout', 'ApiEndpoint','GetParams', function ($scope, $http,$timeout, ApiEndpoint,GetParams) {
		// $scope.activeIndex = 4;
		var params = new GetParams.UrlSearch();
		$scope.orderInfo = {};
        $scope.orderInfo.orderId = params.orderId;
        $scope.orderInfo.orderCode = params.orderCode;
        $scope.orderInfo.orderTurnover = params.orderTurnover / 100;
        $scope.orderInfo.description = params.description;

		$scope.balancePaySubmit = function () {
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
                    Materialize.toast('支付成功',3000);
                    $timeout(function(){
	                    window.history.go(-1);
                    },3000)
                }
            })
        }
	}])

	//支付宝支付
	.controller('AliPayCtrl', ['$scope', '$http', 'ApiEndpoint','GetParams', function ($scope, $http, ApiEndpoint,GetParams) {
		var params = new GetParams.UrlSearch();
		$scope.orderInfo = {};
        $scope.orderInfo.orderId = params.orderId;
        $scope.orderInfo.orderCode = params.orderCode;
        $scope.orderInfo.orderTurnover = params.orderTurnover / 100;
        $scope.orderInfo.description = params.description;

		$scope.aliPaySubmit = function () {
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
	}])

	//微信支付
	.controller('WechatPayCtrl', ['$scope', '$http', 'ApiEndpoint','GetParams', function ($scope, $http, ApiEndpoint,GetParams) {
		var params = new GetParams.UrlSearch();
		$scope.orderInfo = {};
        $scope.orderInfo.orderId = params.orderId;
        $scope.orderInfo.orderCode = params.orderCode;
        $scope.orderInfo.orderTurnover = params.orderTurnover / 100;
        $scope.orderInfo.description = params.description;

		$scope.wechatPaySubmit = function () {
            /*$http({
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
                    Materialize.toast('支付成功',3000);
                }
            })*/
        }

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
                    width: 200,
                    height: 200
                });

                qrcode.makeCode(data.result.code_url);
            }
        })
	}])

	//体验券支付
	.controller('CouponPayCtrl', ['$scope', '$http', 'ApiEndpoint','GetParams', function ($scope, $http, ApiEndpoint,GetParams) {
		var params = new GetParams.UrlSearch();
		$scope.orderInfo = {};
        $scope.orderInfo.orderId = params.orderId;
        $scope.orderInfo.orderCode = params.orderCode;
        $scope.orderInfo.orderTurnover = params.orderTurnover / 100;
        $scope.orderInfo.description = params.description;

		$scope.couponPaySubmit = function () {
            /*$http({
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
                    Materialize.toast('支付成功',3000);
                }
            })*/
        }
	}])


	//个人中心
	.controller('PersonalCenterCtrl', ['$scope', '$http','ApiEndpoint','GetParams', function ($scope, $http,ApiEndpoint,GetParams) {
		//用户资料
		$scope.userData = function(item){
			$scope.item = item;
		
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
	                if($scope.user.userSex == '男'){
	                	$scope.user.sex = 1;
	                }else if($scope.user.userSex == '女'){
	                	$scope.user.sex = 2;
	                }
	            }
	        })

	        // 保存
	        $scope.keepInfo = function () {
	            $http({
	                method: 'POST',
	                url: ApiEndpoint.url + 'user/modifyUser.do',
	                data: $.param({
	                    userId: localStorage.userId,
	                    userName: $scope.user.userName,
	                    mobile: $scope.user.userPhone,
	                    sex: $scope.user.userSex,
	                    address: $scope.user.userAddress,
	                    email: $scope.user.userEmail
	                }),
	                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	            }).success(function (data) {
	                if (data.errorCode == 0) {
	                    Materialize.toast('修改成功',3000);
	                } else {
	                    Materialize.toast('修改失败',3000);
	                }
	            })
	        }
        }
        

        // 我的活动
        $scope.userActivity = function(item){
        	$scope.item = item;

        	/*$http({
	            method: 'POST',
	            url: ApiEndpoint.url + '.do',
	            data: $.param({
	                userId: localStorage.userId
	            }),
	            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	        }).success(function (data) {
	            if (data.errorCode == 0) {
	                
	            }
	        })*/
        }


        // 我的收藏
        $scope.userCollection = function(item){
        	$scope.item = item;

        	$scope.collectionType = 1;
	        $scope.getMyCollection = function (type) {
	            $scope.collectionType = type;

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

        }


        // 消费记录
        $scope.userConsume = function(item){
        	$scope.item = item;

        }


        // 历史记录
        $scope.userHistory = function(item){
        	$scope.item = item;

        }


        // 充值兑换
        $scope.userRecharge = function(item){
        	$scope.item = item;

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

	        //充值记录
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

        }


        // 账户设置
        $scope.userSetting = function(item){
        	$scope.item = item;

    		$scope.registerData = {};

        	$scope.pswBtn = function(){
        		if (!$scope.registerData.password) {
	                Materialize.toast("新密码不能为空",3000);
	            } else if (!$scope.registerData.rpassword) {
	                Materialize.toast("确认密码不能为空",3000);
	            } else if ($scope.registerData.password.length < 6) {
	                Materialize.toast("密码长度不能少于6位",3000);
	            } else if ($scope.registerData.rpassword != $scope.registerData.password) {
	                Materialize.toast("两次输入的密码不一致",3000);
	            } else {
	            	$http({
			            method: 'POST',
			            url: ApiEndpoint.url + 'user/modifyPassword.do',
			            data: $.param({
			                userId: localStorage.userId,
	                        newPwd: $scope.registerData.password,
	                        confirmPwd: $scope.registerData.rpassword
			            }),
			            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
			        }).success(function (data) {
	                    if (data.errorCode == 0) {
	                        Materialize.toast("修改成功",3000);
	                    }
	                })
	            }
        	}
        }


        var urlParams = new GetParams.UrlSearch();
		if(urlParams.id != undefined && urlParams.id != ''){
			//url有id值时说明通过点击个人中心下拉列表
			$scope.item = urlParams.id;

			switch(parseInt(urlParams.id)){
				case 7:

					break;
				case 3:
					$scope.userCollection(3);
					break;
				case 6:

					break;
				case 5:

					break;
				default:
					alert(1111111);
			}
		}else if(urlParams.id == undefined || urlParams.id == ''){
			//url没有id值时默认显示用户资料
			$scope.userData(1);
		}

	}])