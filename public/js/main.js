// $('#get-matches').click(function (e) {
//
//     let search = $('#init-text').val();
//
//     $('#get-matches').prop('disabled', true);
//
//     $('#loading-img').fadeIn();
//
//     $.ajax({
//         type: 'GET',
//         url: '/monitor/loadallmatches',
//         success: function (data) {
//             $('#responce-text').html(data);
//             // $('#get-odds').show();
//             // $('#get-matches').fadeOut();
//             getMatches();
//         },
//         error: function (err) {
//             console.log(err);
//         }
//     });
//
// });

function refreshMatches() {
    let search = $('#init-text').val();

    $('#get-matches').prop('disabled', true);

    $('#loading-img').fadeIn();

    $.ajax({
        type: 'GET',
        url: '/monitor/loadallmatches',
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
}

function getMatches() {

    $('#loading-img').fadeIn();

    let links = $('#links-list').children();

    console.log('Total links to work: ' + links.length);

    links.each(function (index) {

        let added = ($('#matches-list').children()).length;

        let href = $(this).text();

        setTimeout(function () {
            $.ajax({
                type: 'POST',
                url: '/monitor/getmatch',
                data: {link: href},
                success: function (data) {

                    // $('#matches-list')
                    //     .append('<li>' + JSON.stringify(data) + '</li>');

                    let pinnacle = '',
                        marathonbet = '',
                        xbet = '';

                    if (data.pinnacle) {

                        if ((data.pinnacle.odds).length > 0) {
                            pinnacle = '<span><b>Pinnacle: </b>' + (data.pinnacle.odds).join(', ') + '</span>';
                        }

                        if ((data.marathonbet.odds).length > 0) {
                            marathonbet = '<span><b>Marathonbet: </b>' + (data.marathonbet.odds).join(', ') + '</span>';
                        }

                        if ((data.xbet.odds).length > 0) {
                            xbet = '<span><b>1xbet: </b>' + (data.xbet.odds).join(', ') + '</span>';
                        }

                        if ((data.pinnacle.odds).length === 0 && (data.marathonbet.odds).length === 0) {
                            console.log('There are no useful odds on link: ' + href);
                        } else {

                            $('#matches-list')
                                .append('<li><div><a href="' + href + '" target="_blank"><h5>' + data.title + '</h5></a><p>' + data.date + '</p><div>' +
                                    '<div class="row" style="width: 800px;">' +
                                    '<div class="col">' + pinnacle + '<br>' + (data.pinnacle.blob ? JSON.stringify(data.pinnacle.blob) : '') + '</div>' +
                                    '<div class="col">' + marathonbet + '<br>' + (data.marathonbet.blob ? JSON.stringify(data.marathonbet.blob) : '') + '</div>' +
                                    '<div class="col">' + xbet + '<br>' + (data.xbet.blob ? JSON.stringify(data.xbet.blob) : '') + '</div>' +
                                    '</div><p>Delta pinnacle = ' + data.pinnacle.delta + '</p>' +
                                    '<p>Delta marathonbet = ' + data.marathonbet.delta + '</p>' +
                                    '<p>Delta xbet = ' + data.xbet.delta + '</p>' +
                                    '<hr></li>')
                        }

                        if (i >= links.length) {

                            $('#loading-img').fadeOut();
                            $('#get-matches').prop('disabled', false);

                        }
                    }

                },
                error: function (err) {
                    console.log(err);
                }
            });
        }, 1000 * index);


    });
}

refreshMatches();

setInterval(function () {
    refreshMatches();
}, 3600000);
