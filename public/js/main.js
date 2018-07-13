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

    let links = $('#links-list').children();

    console.log(links.length);

    let i = {
        count: 0
    };

    links.each(function () {

        let added = ($('#matches-list').children()).length;

        let href = $(this).text();

        $.ajax({
            type: 'POST',
            url: '/getmatch2',
            data: {link: href},
            success: function (data) {

                i.count++;

                $('#matches-list')
                    .append('<li>' + JSON.stringify(data) + '</li>');

                // let pinnacle = '',
                //     marathonbet = '';
                //
                // if ((data.pinnacle.odds).length > 0) {
                //     pinnacle = '<span><b>Pinnacle: </b>' + (data.pinnacle.odds).join(', ') + '</span>';
                // }
                //
                // if ((data.marathonbet.odds).length > 0) {
                //     marathonbet = '<span><b>Marathonbet: </b>' + (data.marathonbet.odds).join(', ') + '</span>';
                // }
                //
                // if ((data.pinnacle.odds).length === 0 && (data.marathonbet.odds).length === 0) {
                //     console.log('There are no useful odds on link: ' + href);
                // } else {
                //     $('#matches-list')
                //         .append('<li><a href="' + href + '" target="_blank"><h5>' + data.title + '</h5></a>' + pinnacle + '<span style="color: gray">&nbsp;/&nbsp;</span>' + marathonbet + '<hr></li>')
                // }

                if (i >= links.length) {

                    $('#loading-img').fadeOut();
                    $('#get-matches').prop('disabled', false);

                }

            },
            error: function (err) {
                console.log(err);
            }
        });
    });
}