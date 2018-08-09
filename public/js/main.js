function refreshMatches() {

    $('#get-matches').prop('disabled', true);

    $('#loading-img').fadeIn();

    $.ajax({
        type: 'GET',
        url: '/monitor/loadallmatches',
        success: function (data) {

            let linksUl = '<ul style="list-style-type: none; font-size: 10px" id="links-list">';

            data.forEach(function (item) {
                linksUl += '<li>' + 'http://www.oddsportal.com' + item + '</li>';
            });

            linksUl += '</ul>';

            $('#responce-text').html(linksUl);
            // $('#get-odds').show();
            // $('#get-matches').fadeOut();
            getMatches();
        },
        error: function (err) {
            console.log(err);
        }
    });
}

$('.archive-btn').click(function (e) {
    let target = $(e.target);
    if (target.attr('x-target').length > 0) {
        $.ajax({
            type: 'POST',
            url: '/logs/disable/' + target.attr('x-target'),
            success: function (data) {
                $(target).parent().parent().hide();
            },
            error: function (err) {
                console.log(err);
            }
        });
    }
});

$('.delete-btn').click(function (e) {
    let target = $(e.target);
    if (target.attr('x-target').length > 0) {
        $.ajax({
            type: 'POST',
            url: '/archives/delete/' + target.attr('x-target'),
            success: function (data) {
                $(target).parent().parent().hide();
            },
            error: function (err) {
                console.log(err);
            }
        });
    }
});
$('#delete-all-btn').click(function (e) {
        $.ajax({
            type: 'POST',
            url: '/archives/delete-all',
            success: function (data) {
                window.location.reload(false);
            },
            error: function (err) {
                console.log(err);
            }
        });
});

function getMatches() {

    $('#loading-img').fadeIn();

    let links = $('#links-list').children();

    console.log('Total links to work: ' + links.length);

    let i = 0,
        t = 0;

    let mySecondsTimer = setInterval(myTimer, 1000);

    function myTimer() {
        $('#seconds-work').text(t + ' s.');
        t++;
    }

    function loadNext() {

        $('#remaining-items').text(links.length - i);

        if (i < links.length) {

            let href = $(links[i]).text();

            $.ajax({
                type: 'POST',
                url: '/monitor/getmatch',
                data: {link: href},
                success:function(data){
                    let pinnacleBlob = '',
                        marathonBlob = '',
                        xbetBlob = '';

                    if (data.pinnacle) {

                        if ((data.pinnacle.odds).length > 0) {
                            if (data.pinnacle.blob) {

                                pinnacleBlob = `<h4><b>Pinnacle</b></h4><p>Odds: ${data.pinnacle.odds} </p>`;

                                data.pinnacle.blob.items.forEach(function (e) {
                                    pinnacleBlob += `<div><span>${e.date} / </span><span>${e.val} / </span><span>${e.inc_dec}</span></div>`;
                                });

                                pinnacleBlob += `<div style="margin-top: 10px; margin-bottom: 10px;"><span><b>OpenOdds: </b></span><span>${data.pinnacle.blob.openOdds.date}</span>&nbsp;|&nbsp;<span>${data.pinnacle.blob.openOdds.val}</span></div>`;

                            }
                        }

                        if ((data.marathonbet.odds).length > 0) {
                            if (data.marathonbet.blob) {
                                marathonBlob = `<h4><b>Marathonbet</b></h4><p>Odds: ${data.marathonbet.odds} </p>`;

                                data.marathonbet.blob.items.forEach(function (e) {
                                    marathonBlob += `<div><span>${e.date} / </span><span>${e.val} / </span><span>${e.inc_dec}</span></div>`;
                                });

                                marathonBlob += `<div style="margin-top: 10px; margin-bottom: 10px;"><span><b>OpenOdds: </b></span><span>${data.marathonbet.blob.openOdds.date}</span>&nbsp;|&nbsp;<span>${data.marathonbet.blob.openOdds.val}</span></div>`;

                            }
                        }

                        if ((data.xbet.odds).length > 0) {
                            if (data.xbet.blob) {
                                xbetBlob = `<h4><b>1Xbet</b></h4><p>Odds: ${data.xbet.odds} </p>`;

                                data.xbet.blob.items.forEach(function (e) {
                                    xbetBlob += `<div><span>${e.date} / </span><span>${e.val} / </span><span>${e.inc_dec}</span></div>`;
                                });

                                xbetBlob += `<div style="margin-top: 10px; margin-bottom: 10px;"><span><b>OpenOdds: </b></span><span>${data.xbet.blob.openOdds.date}</span>&nbsp;|&nbsp;<span>${data.xbet.blob.openOdds.val}</span></div>`;

                            }
                        }

                        if ((data.pinnacle.odds).length === 0 && (data.marathonbet.odds).length === 0 && (data.xbet.odds).length === 0) {
                            console.log('There are no useful odds on link: ' + href);
                        } else {

                            $('#matches-list')
                                .append('<li><div><a href="' + href + '" target="_blank"><h3>' + data.title + '</h3></a><p>' + data.date + '</p><p>' + data.league + '</p><div>' +
                                    '<div class="row" style="max-width: 860px;">' +
                                    '<div class="col-lg-4">' + pinnacleBlob + '</div>' +
                                    '<div class="col-lg-4">' + xbetBlob + '</div>' +
                                    '<div class="col-lg-4">' + marathonBlob + '</div>' +
                                    '</div><span>Delta pinnacle = ' + data.pinnacle.delta + '</span>, ' +
                                    '<span>Delta marathonbet = ' + data.marathonbet.delta + '</span>, ' +
                                    '<span>Delta xbet = ' + data.xbet.delta + '</span>' +
                                    '<hr></li>')
                        }

                    }
                    loadNext();
                },
                error: function(){
                    loadNext();
                },
                timeout: 15000
            });

            i++;
            if (i >= links.length) {

                $('#loading-img').fadeOut();
                $('#get-matches').prop('disabled', false);
                clearInterval(mySecondsTimer);

            }
        }
    }

    loadNext();
}
