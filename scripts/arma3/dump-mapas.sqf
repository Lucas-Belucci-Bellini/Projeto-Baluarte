private _t0 = diag_tickTime;

private _fnc_lim = {
    private _s = _this;
    if (isNil "_s") exitWith { "" };
    if !(_s isEqualType "") exitWith { str _s };
    if (_s select [0, 1] == "$") then { _s = localize _s };
    _s = _s regexReplace ["\\", "/"];
    _s = _s regexReplace ["""", "'"];
    _s = _s regexReplace ["\|", "/"];
    _s = _s regexReplace ["[\r\n\t]+", " "];
    _s
};

private _fnc_sub = {
    private _s = _this call _fnc_lim;
    _s = _s regexReplace ["[;:]", " "];
    _s
};

private _fnc_num = { _this toFixed 3 };

private _fnc_n = {
    if (isNumber _this) then { (getNumber _this) toFixed 3 } else { "" };
};

private _fnc_pedacos = {
    params ["_marca", "_classe", "_texto"];
    if (_texto == "") exitWith {};
    while { count _texto > 0 } do {
        private _p = _texto select [0, 700];
        diag_log text (format ["<<A3MAPA>>%1|%2|%3", _marca, _classe, _p]);
        _texto = _texto select [700];
    };
};

diag_log text "<<A3MAPA>>INICIO|v1";

private _mundos = "getText (_x >> 'worldName') != ''" configClasses (configFile >> "CfgWorlds");

private _nMundos = 0;
private _nLocais = 0;

{
    private _cfg = _x;
    private _classe = configName _cfg;

    diag_log text (format ["<<A3MAPA>>W|%1|%2|%3|%4|%5|%6|%7|%8",
        _classe,
        (getText (_cfg >> "description")) call _fnc_lim,
        (getText (_cfg >> "author")) call _fnc_lim,
        (configSourceMod _cfg) call _fnc_lim,
        (_cfg >> "mapSize") call _fnc_n,
        (_cfg >> "longitude") call _fnc_n,
        (_cfg >> "latitude") call _fnc_n,
        (_cfg >> "elevationOffset") call _fnc_n
    ]);

    diag_log text (format ["<<A3MAPA>>WP|%1|%2|%3|%4",
        _classe,
        (getText (_cfg >> "pictureMap")) call _fnc_lim,
        (getText (_cfg >> "pictureShot")) call _fnc_lim,
        (getText (_cfg >> "icon")) call _fnc_lim
    ]);

    diag_log text (format ["<<A3MAPA>>WW|%1|%2|%3|%4|%5|%6|%7",
        _classe,
        (getText (_cfg >> "worldName")) call _fnc_lim,
        (getText (_cfg >> "plateFormat")) call _fnc_lim,
        (getText (_cfg >> "plateLetters")) call _fnc_lim,
        (_cfg >> "mapZone") call _fnc_n,
        (getText (_cfg >> "startTime")) call _fnc_lim,
        (getText (_cfg >> "startDate")) call _fnc_lim
    ]);

    private _centro = getArray (_cfg >> "centerPosition");
    private _anc = getArray (_cfg >> "safePositionAnchor");
    diag_log text (format ["<<A3MAPA>>WC|%1|%2|%3|%4|%5|%6",
        _classe,
        if (count _centro > 0) then { (_centro select 0) call _fnc_num } else { "" },
        if (count _centro > 1) then { (_centro select 1) call _fnc_num } else { "" },
        if (count _anc > 0) then { (_anc select 0) call _fnc_num } else { "" },
        if (count _anc > 1) then { (_anc select 1) call _fnc_num } else { "" },
        (_cfg >> "safePositionRadius") call _fnc_n
    ]);

    private _zooms = [];
    {
        _zooms pushBack format ["%1:%2:%3:%4:%5:%6",
            if (isNumber (_x >> "zoomMax")) then { str (getNumber (_x >> "zoomMax")) } else { "" },
            (getText (_x >> "format")) call _fnc_sub,
            (getText (_x >> "formatX")) call _fnc_sub,
            (getText (_x >> "formatY")) call _fnc_sub,
            (_x >> "stepX") call _fnc_n,
            (_x >> "stepY") call _fnc_n
        ];
    } forEach ("true" configClasses (_cfg >> "Grid"));

    diag_log text (format ["<<A3MAPA>>WG|%1|%2|%3",
        _classe,
        (_cfg >> "Grid" >> "offsetX") call _fnc_n,
        (_cfg >> "Grid" >> "offsetY") call _fnc_n
    ]);
    ["WGZ", _classe, _zooms joinString ";"] call _fnc_pedacos;

    private _portos = [];
    private _ils = getArray (_cfg >> "ilsPosition");
    private _dir = getArray (_cfg >> "ilsDirection");
    if (count _ils > 1) then {
        _portos pushBack format ["principal:%1:%2:%3:%4",
            (_ils select 0) call _fnc_num,
            (_ils select 1) call _fnc_num,
            if (count _dir > 0) then { (_dir select 0) call _fnc_num } else { "" },
            if (count _dir > 2) then { (_dir select 2) call _fnc_num } else { "" }
        ];
    };
    {
        private _p = getArray (_x >> "ilsPosition");
        private _d = getArray (_x >> "ilsDirection");
        if (count _p > 1) then {
            _portos pushBack format ["%1:%2:%3:%4:%5",
                (configName _x) call _fnc_sub,
                (_p select 0) call _fnc_num,
                (_p select 1) call _fnc_num,
                if (count _d > 0) then { (_d select 0) call _fnc_num } else { "" },
                if (count _d > 2) then { (_d select 2) call _fnc_num } else { "" }
            ];
        };
    } forEach ("true" configClasses (_cfg >> "SecondaryAirports"));
    ["WA", _classe, _portos joinString ";"] call _fnc_pedacos;

    private _locais = [];
    {
        private _pos = getArray (_x >> "position");
        if (count _pos > 1) then {
            _locais pushBack format ["%1:%2:%3:%4:%5:%6",
                (getText (_x >> "name")) call _fnc_sub,
                (getText (_x >> "type")) call _fnc_sub,
                (_pos select 0) call _fnc_num,
                (_pos select 1) call _fnc_num,
                (_x >> "radiusA") call _fnc_n,
                (_x >> "radiusB") call _fnc_n
            ];
        };
    } forEach ("true" configClasses (_cfg >> "Names"));

    diag_log text (format ["<<A3MAPA>>WLN|%1|%2", _classe, count _locais]);
    ["WL", _classe, _locais joinString ";"] call _fnc_pedacos;

    _nLocais = _nLocais + count _locais;
    _nMundos = _nMundos + 1;
} forEach _mundos;

private _dt = diag_tickTime - _t0;
diag_log text (format ["<<A3MAPA>>FIM|%1|%2|%3", _nMundos, _nLocais, _dt toFixed 1]);

private _msg = format ["DUMP MAPAS OK em %1 s - %2 mundos, %3 localidades. Rode: python scripts/arma3/parse-mapas.py",
    _dt toFixed 1, _nMundos, _nLocais];
hint _msg;
systemChat _msg;
copyToClipboard _msg;
_msg
