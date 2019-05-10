window.blocksAnimatation = {

	cfg: null,
	animation: {
		scroll: [],
		hover: [],
		active: []
	},
	alreadyAnimated: {},
	mouse: { x:0, y:0 },
	activeAnimation: {
		//elId: {x, y, width, height}
	},
	animatedSectionCount: 0,

	set: function(cfg) {
		window.blocksAnimatation.cfg = cfg;

		var hideStyle = document.createElement('style');
		hideStyle.type = 'text/css';

		Object.keys(cfg).forEach(function(blockName) {
			var styleAdd = function(blockName, blockCfg) {
				if (blockCfg.scroll && blockCfg.scroll.effectName && blockCfg.scroll.effectName!=='nope') {
					hideStyle.innerHTML += '#block-' + blockName + ' { visibility: hidden; }';
					hideStyle.innerHTML += blockCfg.scroll.style;
				}
				if (blockCfg.hover && blockCfg.hover.effectName && blockCfg.hover.effectName!=='nope') {
					hideStyle.innerHTML += blockCfg.hover.style;
				}
			};
			var blockCfg = cfg[blockName];
			styleAdd(blockName, blockCfg);
			if (blockCfg.scroll && blockCfg.scroll.effectName && blockCfg.scroll.effectName!== 'nope' && blockCfg.include) {
				blockCfg.include.forEach(function(subblockName) {
					hideStyle.innerHTML += '#block-' + subblockName + ' { visibility: hidden; }';
				});
			}
		});
		if (hideStyle) {
			document.getElementsByTagName('head')[0].appendChild(hideStyle);
		}
	},

	run: function() {
		var cfg = window.blocksAnimatation.cfg;
		var self = blocksAnimatation;
		Object.keys(cfg).forEach(function(blockName) {
			var blockCfg = cfg[blockName];
			var block = jq_144("#block-"+blockName);
			if (blockCfg.scroll) {
				window.blocksAnimatation.animation.scroll.push({
					name: blockName,
					el: block,
					elPos: block.offset().top,
					effectName: blockCfg.scroll.effectName,
					effectClassName: blockCfg.scroll.effectClassName,
					effectDuration: blockCfg.scroll.effectDuration,
					include: blockCfg.include
				});
			}
			if (blockCfg.hover) {
				window.blocksAnimatation.animation.hover.push({
					name: blockName,
					el: block,
					cfg: blockCfg,
					effectName: blockCfg.hover.effectName,
					effectClassName: blockCfg.hover.effectClassName,
					include: blockCfg.include
				});
			}
		});


		var animateVisible = function() {
			window.blocksAnimatation.animation.scroll.forEach(function(block){
				if (window.blocksAnimatation.alreadyAnimated[block.name]) {
					return;
				}
				if (!block.effectName || block.effectName === 'nope') {
					return;
				}
				var topOfWindow = jq_144(window).scrollTop();
				var windowHeight = window.innerHeight;
				if (topOfWindow <= block.elPos && block.elPos <= topOfWindow + windowHeight || block.elPos < 0) {
					jq_144(block.el)
						.addClass(block.effectClassName)
						.addClass('visibleForce');
					setTimeout(function () {
						jq_144(block.el).removeClass(block.effectClassName);
					}, block.effectDuration * 1000);
					window.blocksAnimatation.alreadyAnimated[block.name] = true;
					if (block.include) {
						var overflow = document.body.style.overflowX;
						document.body.style.overflowX = 'hidden';
						self.animatedSectionCount++;
						block.include.forEach(function(subblockName){
							jq_144("#block-"+subblockName)
								.addClass(block.effectClassName)
								.addClass('visibleForce');
							setTimeout(function () {
								jq_144("#block-"+subblockName).removeClass(block.effectClassName);
								self.animatedSectionCount--;
								if (!self.animatedSectionCount) {
									document.body.style.overflowX = overflow;
								}
							}, block.effectDuration * 1000);
						});
					}
				}
			});
		};
		jq_144(window).scroll(animateVisible);
		animateVisible();

		window.blocksAnimatation.animation.hover.forEach(function (block) {
			block.el.on('mouseenter', function() {
				if (block.cfg.scroll) {
					block.el.removeClass(block.cfg.scroll);
				}
				var offset = block.el.offset();
				self.activeAnimation[block.name] = {
					left: offset.left,
					right: offset.left + block.el.width(),
					top: offset.top,
					bottom: offset.top + block.el.height(),
					el: block.el,
					effectClassName: block.effectClassName,
					include: block.include
				};
				block.el.addClass(block.effectClassName);
				if (block.include) {
					block.include.forEach(function(subblock) {
						jq_144("#block-"+subblock).addClass(block.effectClassName);
					});
				}
			});
		});

		document.body.addEventListener('mousemove', function(e) {
			var x = e.pageX;
			var y = e.pageY;
			Object.keys(self.activeAnimation).forEach(function(blockName) {
				var block = self.activeAnimation[blockName];
				if (x < block.left || x > block.right || y < block.top || y > block.bottom) {
					block.el.removeClass(block.effectClassName);
					if (block.include) {
						block.include.forEach(function(subblock) {
							jq_144("#block-"+subblock).removeClass(block.effectClassName);
						});
					}
					delete self.activeAnimation[blockName];
				}
			});
		});
	}
};
