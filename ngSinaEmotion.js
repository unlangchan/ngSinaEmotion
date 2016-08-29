(function(window, angular, undefined) {
	'use strict';

	angular.module('SinaEmotion', [])
		.directive('emotion', [
			'$timeout', '$log', 'SinaEmotion',
			function($timeout, $log, SinaEmotion) {
				var categorys = SinaEmotion.categorys,
					emotions = SinaEmotion.emotions,
					cat_current, cat_page;
				return {
					require: '?ngModel',
					scope: {
						ngModel: '=',
						options: '='
					},
					link: function(scope, element, attrs, ngModel) {
						$(element[0]).on("click", function(event) {
							event.stopPropagation();
							var options = scope.options || {};
							if ($('#emotions .categorys')[0]) {
								$('#emotions').css(options);
								$('#emotions').toggle();
								return;
							}
							$('body').append('<div id="emotions"></div>');
							$('#emotions').css(options);
							$('#emotions').html('<div>正在加载，请稍候...</div>');
							$('#emotions').on('click', function(event) {
								event.stopPropagation();
							});

							$('#emotions').html('<div style="float:right"><a href="javascript:void(0);" id="prev">&laquo;</a><a href="javascript:void(0);" id="next">&raquo;</a></div><div class="categorys"></div><div class="container-1"></div><div class="page"></div>');
							$('#emotions #prev').on('click', function() {
								showCategorys(cat_page - 1);
							});
							$('#emotions #next').on('click', function() {
								showCategorys(cat_page + 1);
							});
							showCategorys();
							showEmotions();
							$('body').on('click', function() {
								$('#emotions').remove();
							});
						});

						function showCategorys() {
							var page = arguments[0] ? arguments[0] : 0;
							if (page < 0 || page >= categorys.length / 5) {
								return;
							}
							$('#emotions .categorys').html('');
							cat_page = page;
							for (var i = page * 5; i < (page + 1) * 5 && i < categorys.length; ++i) {
								$('#emotions .categorys').append($('<a href="javascript:void(0);">' + categorys[i] + '</a>'));
							}
							$('#emotions .categorys a').on('click', function() {
								showEmotions($(this).text());
							});
							$('#emotions .categorys a').each(function() {
								if ($(this).text() == cat_current) {
									$(this).addClass('current');
								}
							});
						}

						function showEmotions() {
							var category = arguments[0] ? arguments[0] : '默认';
							var page = arguments[1] ? arguments[1] - 1 : 0;
							$('#emotions .container-1').html('');
							$('#emotions .page').html('');
							cat_current = category;
							for (var i = page * 72; i < (page + 1) * 72 && i < emotions[category].length; ++i) {
								$('#emotions .container-1').append($('<a href="javascript:void(0);" title="' + emotions[category][i].name + '"><img src="' + emotions[category][i].icon + '" alt="' + emotions[category][i].name + '" width="22" height="22" /></a>'));
							}
							$('#emotions .container-1 a').on('click', function() {
								var s = this;
								scope.$apply(function() {
									scope.ngModel += $(s).attr('title');
								});
								$('#emotions').remove();
							});
							for (var i = 1; i < emotions[category].length / 72 + 1; ++i) {
								$('#emotions .page').append($('<a href="javascript:void(0);"' + (i == page + 1 ? ' class="current"' : '') + '>' + i + '</a>'));
							}
							$('#emotions .page a').on('click', function() {
								showEmotions(category, $(this).text());
							});
							$('#emotions .categorys a.current').removeClass('current');
							$('#emotions .categorys a').each(function() {
								if ($(this).text() == category) {
									$(this).addClass('current');
								}
							});
						}
					}

				}
			}
		])
		.service('SinaEmotion', ['$document', '$rootScope', '$q', function($document, $rootScope, $q) {
			function Hashtable() {
				this._hash = new Object();
				this.put = function(key, value) {
					if (typeof(key) != "undefined") {
						if (this.containsKey(key) == false) {
							this._hash[key] = typeof(value) == "undefined" ? null : value;
							return true;
						} else {
							return false;
						}
					} else {
						return false;
					}
				}
				this.remove = function(key) {
					delete this._hash[key];
				}
				this.size = function() {
					var i = 0;
					for (var k in this._hash) {
						i++;
					}
					return i;
				}
				this.get = function(key) {
					return this._hash[key];
				}
				this.containsKey = function(key) {
					return typeof(this._hash[key]) != "undefined";
				}
				this.clear = function() {
					for (var k in this._hash) {
						delete this._hash[k];
					}
				}
			};

			return {
				emotions: new Array(),
				categorys: new Array(),
				load: function() {
					var d = $q.defer(),
						s = this;
					var app_id = '1362404091';
					$.ajax({
						dataType: 'jsonp',
						url: 'https://api.weibo.com/2/emotions.json?source=' + app_id,
						success: function(response) {
							var data = response.data;
							for (var i in data) {
								if (data[i].category == '') {
									data[i].category = '默认';
								}
								if (s.emotions[data[i].category] == undefined) {
									s.emotions[data[i].category] = new Array();
									s.categorys.push(data[i].category);
								}
								s.emotions[data[i].category].push({
									name: data[i].phrase,
									icon: data[i].icon
								});
								s.uSinaEmotionsHt.put(data[i].phrase, data[i].icon);
							}
							d.resolve();
						}
					});
					return d.promise;
				},
				put: function(datas) {
					var s = this;
					angular.forEach(datas, function(value) {
						s.uSinaEmotionsHt.put(value.title, value.url);
					})

				},
				uSinaEmotionsHt: new Hashtable(),
				AnalyticEmotion: function(s) {
					if (typeof(s) != "undefined") {
						var sArr = s.match(/\[.*?\]/g);
						if (sArr != null) {
							for (var i = 0; i < sArr.length; i++) {
								if (this.uSinaEmotionsHt.containsKey(sArr[i])) {
									var style = '';
									if (sArr[i].indexOf("[pt")) {
										style = " height=\"22\" width=\"22\"";
									}
									var reStr = "<img src=\"" + this.uSinaEmotionsHt.get(sArr[i]) + "\"" + style + "/>";

									s = s.replace(sArr[i], reStr);
								}
							}
						}
					}
					return s;
				}
			}
		}])
})(window, window.angular);