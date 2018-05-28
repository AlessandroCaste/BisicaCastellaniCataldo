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