$(document).ready( function() {
	$('.unanswered-getter').submit( function(event){
		// zero out results if previous search has run
		$('.userAnswers').empty();
		$('.results').html('');
		// get the value of the tags the user submitted
		var tags = $(this).find("input[name='tags']").val();
		getUnanswered(tags);
	});

//TOP ANSWERERS FEATURE
	$('.inspiration-getter').submit( function(event){
		$(".results").empty();
		$('.userAnswers').empty();
		// get the value of the tags the user submitted
		var answerers = $(this).find("input[name='answerers']").val();
		// make a call to the stackexchange api
		$.ajax({
			type: "GET",
			url: "http://api.stackexchange.com/2.2/tags/"+answerers+"/top-answerers/all_time?site=stackoverflow",
			dataType: "jsonp",
			success: function(jsonp){
				if (jsonp.items.length == 0) {
					alert("Not a valid option");
				} else {
					for (i = 0; i < jsonp.items.length; i++) {
	   					console.log(jsonp);
						var answererBlock = '<div class="answerer"><span class="answererType"><img src='+jsonp.items[i].user.profile_image+'></span><br /><span class="answererType">'+jsonp.items[i].user.display_name+'</span><br /><span class="answererType"><a href="'+jsonp.items[i].user.link+'"> Profile </a></span></div>';
						$('.userAnswers').prepend(answererBlock);
					}
				};
			},
		});
	});
});


// this function takes the question object returned by StackOverflow 
// and creates new result to be appended to DOM
var showQuestion = function(question) {
	
	// clone our result template code
	var result = $('.templates .question').clone();
	
	// Set the question properties in result
	var questionElem = result.find('.question-text a');
	questionElem.attr('href', question.link);
	questionElem.text(question.title);

	// set the date asked property in result
	var asked = result.find('.asked-date');
	var date = new Date(1000*question.creation_date);
	asked.text(date.toString());

	// set the #views for question property in result
	var viewed = result.find('.viewed');
	viewed.text(question.view_count);

	// set some properties related to asker
	var asker = result.find('.asker');
	asker.html('<p>Name: <a target="_blank" href=http://stackoverflow.com/users/' + question.owner.user_id + ' >' +
													question.owner.display_name +
												'</a>' +
							'</p>' +
 							'<p>Reputation: ' + question.owner.reputation + '</p>'
	);

	return result;
};


// this function takes the results object from StackOverflow
// and creates info about search results to be appended to DOM
var showSearchResults = function(query, resultNum) {
	var results = resultNum + ' results for <strong>' + query;
	return results;
};

// takes error string and turns it into displayable DOM element
var showError = function(error){
	var errorElem = $('.templates .error').clone();
	var errorText = '<p>' + error + '</p>';
	errorElem.append(errorText);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// takes a string of semi-colon separated tags to be searched
// for on StackOverflow
var getUnanswered = function(tags) {
	
	// the parameters we need to pass in our request to StackOverflow's API
	var request = {tagged: tags,
								site: 'stackoverflow',
								order: 'desc',
								sort: 'creation'};
	
	var result = $.ajax({
		url: "http://api.stackexchange.com/2.2/questions/unanswered",
		data: request,
		dataType: "jsonp",
		type: "GET",
		})
	.done(function(result){
		var searchResults = showSearchResults(request.tagged, result.items.length);

		$('.search-results').html(searchResults);

		$.each(result.items, function(i, item) {
			var question = showQuestion(item);
			$('.results').append(question);
		});
	})
	.fail(function(jqXHR, error, errorThrown){
		var errorElem = showError(error);
		$('.search-results').append(errorElem);
	});
};