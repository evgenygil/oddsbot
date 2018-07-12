$('#get-matches').click(function (e) {

    let search = $('#init-text').val();

    $('#get-matches').prop('disabled', true);

    $('#loading-img').fadeIn();

    $.ajax({
        type: 'GET',
        url: '/loadallmatches',
        success: function (data) {
            $('#responce-text').html(data);
            // $('#get-odds').show();
            // $('#get-matches').fadeOut();
            getMatches();
        },
        error: function (err) {
            console.log(err);
        }
    });

});

function getMatches() {

    $('#loading-img').fadeIn();

    let i = 0;
    let links = $('#links-list').children();

    links.each(function () {

        let href = $(this).text();

            $.ajax({
            type: 'POST',
            url: '/getmatch',
            data: {link: href},
            success: function (data) {
                let pinnacle = '',
                    marathonbet = '';

                if ((data.pinnacle.odds).length > 0) {
                    pinnacle = '<span><b>Pinnacle: </b>' + (data.pinnacle.odds).join(', ') + '</span>';
                }

                if ((data.marathonbet.odds).length > 0) {
                    marathonbet = '<span><b>Marathonbet: </b>' + (data.marathonbet.odds).join(', ') + '</span>';
                }

                if ((data.pinnacle.odds).length === 0 && (data.marathonbet.odds).length === 0) {
                    console.log('There are no useful odds on link: ' + href);
                } else {
                    $('#matches-list')
                        .append('<li><a href="' + href + '" target="_blank"><h5>' + data.title + '</h5></a>' + pinnacle + '<span style="color: gray">&nbsp;/&nbsp;</span>' + marathonbet + '<hr></li>')
                }
            },
            error: function (err) {
                console.log(err);
            }
        });
        i++;
        // if (i === links.length) {
        //     $('#loading-img').fadeOut();
        // }
    });
}