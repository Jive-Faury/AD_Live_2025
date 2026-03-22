class initEXT:
	"""
	setCustomPars in comp Tox for preserve dev or creative work

	"""
	def __init__(self, ownerComp):
		# The component to which this extension is attached
		self.ownerComp = ownerComp
		self.opDat = ownerComp.op('opDat')
		self.opTox = ownerComp.op('opTox')
		self.opName = [cell[0].val for cell in self.opDat.rows()[1:]]		
		self.opPath = [cell[1].val for cell in self.opDat.rows()[1:]]
		self.opPathTox = [cell[1].val for cell in self.opTox.rows()[1:]]
				
	def ResetParsOp(self,op):
		for pars in op.customPars:
			pars.val = pars.default
			
	def ResetParsAll(self):		
		for path in self.opPath:
			for pars in op(path).customPars:
				pars.val = pars.default
	
	def SaveStatements(self):
		for path in self.opPathTox:
			op(path).par.externaltox = None
			
	def SaveDevelopment(self):
		for i in range(len(self.opPathTox)):
			op(self.opPathTox[i]).par.externaltox = 'Assets/comp/' + self.opName[i] +'.tox'

	def ReInitAllTox(self):		
		for path in self.opPathTox:
			op(path).par.reinitnet.pulse()
	
	def ReloadToxOnStart(self):
		for path in self.opPathTox:
			
			op(path).par.reloadtoxonstart = True
			
	def ReloadToxOffStart(self):
		for path in self.opPathTox:
			
			op(path).par.reloadtoxonstart = False
		