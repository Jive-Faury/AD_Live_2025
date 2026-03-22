class playBackEXT:
	"""
	playBackEXT description
	"""
	def __init__(self, ownerComp):
		# The component to which this extension is attached
		self.ownerComp     = ownerComp
		self.activation    = ownerComp.par.Activation
		self.onoff         = ownerComp.par.Onoff
		self.play          = ownerComp.par.Play
		self.loop          = ownerComp.par.Loop
		self.playbackdata  = ownerComp.par.Playbackdata
		self.playbackaudio = ownerComp.par.Playbackaudio
		self.audioName     = ownerComp.op('audioName')

	def Activation(self):

		op('../info1').bypass = 1 - self.activation
		op('routing').bypass  = 1 - self.activation
		op('../chopexec_recstop').par.active = self.activation.eval()
		#op('chopexec_realTime').par.active = self.activation.eval()

		if self.activation == True:
			op('resetButtons').run()				
			op('record1').par.record = 3
			op.playAudio.panel.state = 0
			op.cycleAudio.panel.state = 0
			op.reloadAudio.click()
			
		else :
			op('record1').par.record = 0
			op.reloadAudio.click()
			#project.realTime = 1


	def Onoff(self):
		op('timer1').bypass = 1 - self.onoff
		op.audioBox.op('switch3').par.index = self.onoff.eval()


	def Init(self):
		op.sequencerCam.op('clock').par.resetpulse.pulse()
		op.sequencer.op('clock').par.resetpulse.pulse()
		op('timer1').par.initialize.pulse()
		op('timer1').par.start.pulse()

	def Play(self):
		op('timer1').par.play = self.play.eval()

	def Loop(self):
			op('timer1').par.cycle = self.loop.eval()
			if self.loop == True:
				op('audiofilein1').par.repeat = 1
			else:
				op('audiofilein1').par.repeat = 0

	def SaveData(self):
		path = ui.chooseFile(load=False,fileTypes=['clip'],title='Save Play Back as:')
		if (path):
			op('shift1').save(path)

		#dataFile = 'Assets/audio/playBack/' +str(self.audioName[0,0]) +'.clip'
		#op('shift1').save(dataFile)

	def PlayBackData(self):
		if self.playbackdata == True:
			op('../info1').bypass = True
		else:
			op('../info1').bypass = False
	
	def PlayBackAudio(self):
		op('audiofilein1').bypass = 1 - self.playbackaudio
		op('audiodevout1').bypass = 1 - self.playbackaudio		

		if self.playbackaudio == True:
			op.record.op('moviefileout1').par.audiochop.expr = "op.playBackBox.op('audiofilein1')"
		else:
			op.record.op('moviefileout1').par.audiochop.expr = "op.audioBox.op('audiofilein1')"
