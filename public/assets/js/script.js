$(document).ready( function() {
	
	/* logo disappear scrolling down */
	$(window).scroll(function() {
		if ($(window).scrollTop() < 130) {
			$('#fadeout').slideDown(300);
		}
		if ($(window).scrollTop() > 130) {
			$('#fadeout').slideUp(700);
		}
	});
	
	
	/* Filtering Buttons */
	var divs = $('#card_container').children();

	$('#allBtn').on('click', function () {
		divs.show();
		scrollOnClick();
	});
			
	$('#serv1Btn').on('click', function(){
		filterCards('service1', divs);
		scrollOnClick();
	});

	$('#serv2Btn').on('click', function(){
		filterCards('service2', divs);
		scrollOnClick();
	});

	$('#serv3Btn').on('click', function(){
		filterCards('service3', divs);
		scrollOnClick();
	});
	
	$('#zone1Btn').on('click', function(){
		filterCards('zone1', divs);
		scrollOnClick();
	});
	
	$('#zone2Btn').on('click', function(){
		filterCards('zone2', divs);
		scrollOnClick();
	});
	
	$('#zone3Btn').on('click', function(){
		filterCards('zone3', divs);
		scrollOnClick();
	});
	
		
	function filterCards(btnName, cards){
			cards.hide();
			filteredCards = cards.filter(function (a) {
				var src_text = $(this).find('p').text();
				var locs = src_text.split(',');
				return $.inArray(btnName, locs) > -1;
			});
			filteredCards.show();
		};
	
	function scrollOnClick(){
		$('html, body').animate({
        scrollTop: ($('#onClickReturn').offset().top - 250)
    }, 700);
	};
	/* ------ END ------ */
	
	
	/* "Location" carousel caption on other Div*/
	$(function() {
		$('.carousel').carousel();
		var caption = $('div.carousel-item:nth-child(1) .carousel-caption');
		$('.new-caption-area').html(caption.html());
		caption.css('display', 'none');

		$(".carousel").on('slide.bs.carousel',function (evt) {
			var caption = $('div.carousel-item:nth-child(' + ($(evt.relatedTarget).index() + 1) + ') .carousel-caption');
			$('.new-caption-area').html(caption.html());
			caption.css('display', 'none');
		});
	});
	
	/* "Location" More-Button change text
	Use in final version of website
	$('#show_doctor').click(function(){
		var $this = $(this);
		$this.toggleClass('SeeMore');
		if($this.hasClass('SeeMore')){
			$this.text('See Less');
			$('html, body').animate({
				scrollTop: ($this.offset().top)
			});
		}
		else{
			$this.text('See More Doctors');
		}
	});*/
	
	/* "Services" opening dropdown closes the other */	
	$(function(){
		$('#myGroup').on('show.bs.collapse','.collapse', function(){
			$('#myGroup').find('.collapse.show').collapse('hide');
		});
	});
	
})