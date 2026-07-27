diag_log text "<<A3TT>>ETAPA|1|script colado e parseado";

private _alvos = [
    "arifle_MX_F",
    "hgun_P07_F",
    "launch_RPG32_F"
];

private _passos = 24;
private _prefixo = "a3tt";
private _folga = 1.3;
private _altura = 0.30;
private _usarCamera = true;
private _fov = 0.35;
private _forcarDia = true;

diag_log text (format ["<<A3TT>>ETAPA|2|alvos|%1", count _alvos]);

private _temScreenshot = false;
private _fnc_foto = compile "screenshot _this";
private _probe = nil;
_probe = "a3tt_probe.png" call _fnc_foto;
if (!isNil "_probe") then { _temScreenshot = true };
diag_log text (format ["<<A3TT>>ETAPA|3|comando screenshot respondeu|%1", _temScreenshot]);

private _base = [0, 0, 0];
private _temPlayer = !isNull player;
if (_temPlayer) then { _base = getPosATL player };
diag_log text (format ["<<A3TT>>ETAPA|4|player|%1|pos|%2", _temPlayer, _base]);

[_alvos, _passos, _prefixo, _folga, _altura, _base, _fnc_foto, _usarCamera, _fov, _forcarDia] spawn {
    params ["_alvos", "_passos", "_prefixo", "_folga", "_altura", "_base", "_fnc_foto",
            "_usarCamera", "_fov", "_forcarDia"];

    diag_log text "<<A3TT>>ETAPA|5|spawn rodando (jogo despausado)";

    private _dataOriginal = date;
    private _overcastOriginal = overcast;
    if (_forcarDia) then {
        setDate [_dataOriginal select 0, 6, 21, 12, 0];
        0 setOvercast 0;
        0 setRain 0;
        0 setFog 0;
        diag_log text (format ["<<A3TT>>ETAPA|5b|forcei meio-dia|data original|%1", _dataOriginal]);
    };

    private _fnc_modelo = {
        private _c = _this;
        private _m = "";
        {
            private _e = configFile >> _x >> _c >> "model";
            if (_m == "") then {
                if (isText _e) then { _m = getText _e };
            };
        } forEach ["CfgWeapons", "CfgMagazines", "CfgAmmo", "CfgVehicles", "CfgGlasses"];
        if (_m == "") exitWith { "" };
        private _ext = if (count _m > 4) then { toLower (_m select [(count _m) - 4]) } else { "" };
        if (_ext != ".p3d") then { _m = _m + ".p3d" };
        _m
    };

    private _centro = [(_base select 0) + 20, _base select 1, (_base select 2) + 30];
    diag_log text (format ["<<A3TT>>ETAPA|6|centro|%1", _centro]);

    private _cam = objNull;
    if (_usarCamera) then {
        _cam = "camera" camCreate _centro;
        _cam cameraEffect ["internal", "back"];
        showCinemaBorder false;
        camUseNVG false;
        _cam camSetFov _fov;
        _cam camCommit 0;
        diag_log text (format ["<<A3TT>>ETAPA|7|camera|%1|fov|%2", !isNull _cam, _fov]);
    } else {
        diag_log text "<<A3TT>>ETAPA|7|camera desligada por _usarCamera";
    };

    private _ok = 0;
    private _falhas = 0;

    {
        private _classe = _x;
        private _p3d = _classe call _fnc_modelo;
        diag_log text (format ["<<A3TT>>ETAPA|8|%1|model|%2", _classe, _p3d]);

        if (_p3d == "") then {
            diag_log text (format ["<<A3TT>>ERRO|%1|sem model no config", _classe]);
            _falhas = _falhas + 1;
        } else {
            private _obj = createSimpleObject [_p3d, _centro, true];
            diag_log text (format ["<<A3TT>>ETAPA|9|%1|objeto criado|%2", _classe, !isNull _obj]);

            if (isNull _obj) then {
                diag_log text (format ["<<A3TT>>ERRO|%1|createSimpleObject falhou em %2",
                    _classe, _p3d]);
                _falhas = _falhas + 1;
            } else {
                private _bb = boundingBoxReal _obj;
                private _min = _bb select 0;
                private _max = _bb select 1;
                private _tam = 0;
                {
                    private _d = (_max select _x) - (_min select _x);
                    if (_d > _tam) then { _tam = _d };
                } forEach [0, 1, 2];
                if (_tam <= 0) then { _tam = 1 };
                private _dist = _tam * _folga;

                diag_log text (format ["<<A3TT>>OBJ|%1|%2|%3|%4",
                    _classe, _p3d, _tam toFixed 3, _passos]);

                for "_i" from 0 to (_passos - 1) do {
                    private _ang = 360 * _i / _passos;
                    if (!isNull _cam) then {
                        _cam camSetPos [
                            (_centro select 0) + (_dist * sin _ang),
                            (_centro select 1) + (_dist * cos _ang),
                            (_centro select 2) + (_tam * _altura)
                        ];
                        _cam camSetTarget _obj;
                        _cam camSetFov _fov;
                        _cam camCommit 0;
                    };
                    sleep 0.15;

                    private _arq = format ["%1_%2_%3.png", _prefixo, _classe, _i];
                    private _r = nil;
                    _r = _arq call _fnc_foto;
                    diag_log text (format ["<<A3TT>>IMG|%1|%2|%3|%4",
                        _classe, _i, _arq, !isNil "_r"]);
                    sleep 0.1;
                };

                deleteVehicle _obj;
                _ok = _ok + 1;
            };
        };
        sleep 0.1;
    } forEach _alvos;

    if (!isNull _cam) then {
        _cam cameraEffect ["terminate", "back"];
        camDestroy _cam;
    };

    if (_forcarDia) then {
        setDate _dataOriginal;
        0 setOvercast _overcastOriginal;
        diag_log text "<<A3TT>>ETAPA|10|data e clima da missao restaurados";
    };

    diag_log text (format ["<<A3TT>>FIM|%1|%2|%3", _ok, _falhas, _passos]);

    private _msg = format ["TURNTABLE: %1 objetos OK, %2 falharam, %3 fotos cada. Veja as linhas A3TT no .rpt.",
        _ok, _falhas, _passos];
    hint _msg;
    systemChat _msg;
    copyToClipboard _msg;
};

diag_log text "<<A3TT>>ETAPA|4b|spawn agendado";
systemChat "TURNTABLE agendado - DESPAUSE o jogo (o spawn nao roda com o jogo parado)";
"turntable agendado - despause o jogo, depois me mande as linhas A3TT do .rpt"
