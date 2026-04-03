class playBackEXT:

    def __init__(self, ownerComp):
        self.ownerComp     = ownerComp
        self.activation    = ownerComp.par.Activation
        self.onoff         = ownerComp.par.Onoff
        self.play          = ownerComp.par.Play
        self.loop          = ownerComp.par.Loop
        self.playbackdata  = ownerComp.par.Playbackdata
        self.playbackaudio = ownerComp.par.Playbackaudio
        self.audioName     = ownerComp.op('audioName')

    def _setBypass(self, opPath, bypass: bool):
        self.ownerComp.op(opPath).bypass = bypass

    def Activation(self):
        active = self.activation.eval()

        self._setBypass('../info1', not active)
        self._setBypass('routing',  not active)
        self.ownerComp.op('../chopexec_recstop').par.active = active

        if active:
            self.ownerComp.op('resetButtons').run()
            self.ownerComp.op('record1').par.record = 3
            op.playAudio.panel.state  = 0
            op.cycleAudio.panel.state = 0
            op.reloadAudio.click()
        else:
            self.ownerComp.op('record1').par.record = 0
            op.reloadAudio.click()

    def Onoff(self):
        onoff = self.onoff.eval()
        self._setBypass('timer1', not onoff)
        op.audioBox.op('switch3').par.index = int(onoff)

    def Init(self):
        for clock_parent in (op.sequencerCam, op.sequencer):
            clock_parent.op('clock').par.resetpulse.pulse()
        timer = self.ownerComp.op('timer1')
        timer.par.initialize.pulse()
        timer.par.start.pulse()

    def Play(self):
        self.ownerComp.op('timer1').par.play = self.play.eval()

    def Loop(self):
        loop = self.loop.eval()
        self.ownerComp.op('timer1').par.cycle = loop
        self.ownerComp.op('audiofilein1').par.repeat = int(loop)

    def SaveData(self):
        path = ui.chooseFile(load=False, fileTypes=['clip'], title='Save Play Back as:')
        if path:
            self.ownerComp.op('shift1').save(path)
        else:
            debug('[playBackEXT] SaveData: aucun fichier sélectionné.')

    def PlayBackData(self):
        self._setBypass('../info1', not self.playbackdata.eval())

    def PlayBackAudio(self):
        active = self.playbackaudio.eval()
        self._setBypass('audiofilein1', not active)
        self._setBypass('audiodevout1', not active)
        op.record.op('moviefileout1').par.audiochop.expr = (
            "op.playBackBox.op('audiofilein1')" if active
            else "op.audioBox.op('audiofilein1')"
        )