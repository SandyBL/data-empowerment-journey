(() => {
    const calculator = document.getElementById('bad-data-calculator-form');
    const employeesInput = document.getElementById('bad-data-employees');
    const hoursInput = document.getElementById('bad-data-hours');
    const salaryInput = document.getElementById('bad-data-salary');
    const amountOutput = document.getElementById('bad-data-loss-amount');
    const inlineAmounts = document.querySelectorAll('[data-bad-data-inline-loss]');
    const calculatorError = document.getElementById('bad-data-calculator-error');
    const currencyPrefix = document.getElementById('bad-data-currency-prefix');
    const downloadButton = document.getElementById('bad-data-pdf-download');
    const downloadStatus = document.getElementById('bad-data-download-status');

    if (!calculator || !downloadButton) return;

    const html2canvasUrl = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    const jsPdfUrl = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    const languageSettings = {
        en: {
            locale: 'en-US',
            currency: 'USD',
            prefix: '$',
            template: '/assets/templates/bad-data-calculator/report-en.html',
            filename: 'cost-of-data-friction-report.pdf',
            invalid: 'Enter valid values in all three fields.',
            maxHours: 'The maximum allowed is 40 hours per week.',
            ready: 'No form required. Immediate download.',
            loading: 'Generating your personalized report…',
            success: 'Your report is ready. The download has started.',
            pdfError: 'The report could not be generated. Please try again.'
        },
        es: {
            locale: 'es-ES',
            currency: 'EUR',
            prefix: '€',
            template: '/assets/templates/bad-data-calculator/report-es.html',
            filename: 'informe-costo-friccion-de-datos.pdf',
            invalid: 'Introduce valores válidos en los tres campos.',
            maxHours: 'El máximo permitido es de 40 horas por semana.',
            ready: 'Sin formulario. Descarga inmediata.',
            loading: 'Generando tu informe personalizado…',
            success: 'Tu informe está listo. La descarga ha comenzado.',
            pdfError: 'No se pudo generar el informe. Inténtalo de nuevo.'
        },
        pt: {
            locale: 'pt-BR',
            currency: 'BRL',
            prefix: 'R$',
            template: '/assets/templates/bad-data-calculator/report-pt.html',
            filename: 'relatorio-custo-friccao-de-dados.pdf',
            invalid: 'Insira valores válidos nos três campos.',
            maxHours: 'O máximo permitido é de 40 horas por semana.',
            ready: 'Sem formulário. Download imediato.',
            loading: 'Gerando seu relatório personalizado…',
            success: 'Seu relatório está pronto. O download começou.',
            pdfError: 'Não foi possível gerar o relatório. Tente novamente.'
        }
    };

    let currentCalculation = null;
    let isGeneratingPdf = false;

    const getLanguage = () => {
        const language = document.documentElement.lang?.split('-')[0];
        return languageSettings[language] ? language : 'es';
    };

    const getSettings = () => languageSettings[getLanguage()];

    const setDownloadStatus = message => {
        downloadStatus.textContent = message;
    };

    const calculateLoss = () => {
        const employees = Number(employeesInput.value);
        const weeklyHours = Number(hoursInput.value);
        const salary = Number(salaryInput.value);
        const exceedsWeeklyHoursLimit = weeklyHours > 40;
        const isValid = employeesInput.checkValidity()
            && hoursInput.checkValidity()
            && salaryInput.checkValidity()
            && employees > 0
            && weeklyHours > 0
            && salary > 0;

        if (!isValid) {
            currentCalculation = null;
            calculatorError.textContent = exceedsWeeklyHoursLimit ? getSettings().maxHours : getSettings().invalid;
            hoursInput.setAttribute('aria-invalid', String(!hoursInput.checkValidity()));
            amountOutput.textContent = '—';
            inlineAmounts.forEach(element => { element.textContent = '—'; });
            return null;
        }

        const annualLoss = employees * weeklyHours * salary / 40;
        currentCalculation = {
            employees,
            weeklyHours,
            salary,
            annualLoss,
            directLaborLoss: annualLoss * 0.55,
            opportunityCostLoss: annualLoss * 0.30,
            reworkLoss: annualLoss * 0.15
        };

        calculatorError.textContent = '';
        hoursInput.removeAttribute('aria-invalid');
        const formattedLoss = new Intl.NumberFormat(getSettings().locale, {
            style: 'currency',
            currency: getSettings().currency,
            maximumFractionDigits: 0
        }).format(annualLoss);
        amountOutput.textContent = formattedLoss;
        inlineAmounts.forEach(element => { element.textContent = formattedLoss; });
        return currentCalculation;
    };

    const updateLanguage = () => {
        currencyPrefix.textContent = getSettings().prefix;
        calculateLoss();
        if (!isGeneratingPdf) setDownloadStatus(getSettings().ready);
    };

    const replaceTemplateFields = (template, calculation) => {
        const numberFormatter = new Intl.NumberFormat(getSettings().locale, { maximumFractionDigits: 0 });
        const values = {
            NUM_EMPLOYEES: numberFormatter.format(calculation.employees),
            WEEKLY_HOURS: numberFormatter.format(calculation.weeklyHours),
            AVG_SALARY: numberFormatter.format(calculation.salary),
            TOTAL_ANNUAL_LOSS: numberFormatter.format(calculation.annualLoss),
            DIRECT_LABOR_LOSS: numberFormatter.format(calculation.directLaborLoss),
            OPPORTUNITY_COST_LOSS: numberFormatter.format(calculation.opportunityCostLoss),
            REWORK_LOSS: numberFormatter.format(calculation.reworkLoss)
        };

        return Object.entries(values).reduce(
            (filledTemplate, [key, value]) => filledTemplate.replaceAll(`{{${key}}}`, value),
            template
        );
    };

    const waitForFrameAssets = async frame => {
        const frameDocument = frame.contentDocument;
        if (frameDocument.fonts?.ready) await frameDocument.fonts.ready;
        await Promise.all([...frameDocument.images].map(image => {
            if (image.complete) return Promise.resolve();
            return new Promise(resolve => {
                image.addEventListener('load', resolve, { once: true });
                image.addEventListener('error', resolve, { once: true });
            });
        }));
    };

    const loadFrameScript = (frame, source, isReady) => new Promise((resolve, reject) => {
        if (isReady()) {
            resolve();
            return;
        }

        const script = frame.contentDocument.createElement('script');
        script.src = source;
        script.crossOrigin = 'anonymous';
        script.referrerPolicy = 'no-referrer';
        script.addEventListener('load', resolve, { once: true });
        script.addEventListener('error', () => reject(new Error('PDF renderer unavailable')), { once: true });
        frame.contentDocument.head.append(script);
    });

    const generatePdf = async calculation => {
        const response = await fetch(getSettings().template);
        if (!response.ok) throw new Error('Report template unavailable');

        const template = replaceTemplateFields(await response.text(), calculation);
        const reportDocument = new DOMParser().parseFromString(template, 'text/html');
        const exportStyles = reportDocument.createElement('style');
        exportStyles.textContent = `
            html, body { width: 210mm !important; margin: 0 !important; background: #fff !important; }
            body { padding: 0 !important; gap: 0 !important; }
            .page { width: 210mm !important; min-height: 297mm !important; height: 297mm !important; box-shadow: none !important; }
            .page:last-child { page-break-after: auto !important; }
        `;
        reportDocument.head.append(exportStyles);

        const frame = document.createElement('iframe');
        frame.className = 'bad-data-report-frame';
        frame.title = 'PDF report renderer';
        frame.setAttribute('aria-hidden', 'true');
        const frameLoaded = new Promise((resolve, reject) => {
            frame.addEventListener('load', resolve, { once: true });
            frame.addEventListener('error', reject, { once: true });
        });
        frame.srcdoc = `<!DOCTYPE html>${reportDocument.documentElement.outerHTML}`;
        document.body.append(frame);

        try {
            await frameLoaded;
            await waitForFrameAssets(frame);
            const frameDocument = frame.contentDocument;
            await loadFrameScript(frame, html2canvasUrl, () => typeof frame.contentWindow.html2canvas === 'function');
            await loadFrameScript(frame, jsPdfUrl, () => typeof frame.contentWindow.jspdf?.jsPDF === 'function');

            const pages = [...frameDocument.querySelectorAll('.page')];
            if (pages.length !== 3) throw new Error('Unexpected report page count');

            const { jsPDF } = frame.contentWindow.jspdf;
            const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true });

            for (const [index, page] of pages.entries()) {
                const canvas = await frame.contentWindow.html2canvas(page, {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    backgroundColor: '#ffffff',
                    scrollX: 0,
                    scrollY: 0,
                    windowWidth: page.scrollWidth,
                    windowHeight: page.scrollHeight
                });
                if (index > 0) pdf.addPage('a4', 'portrait');
                pdf.addImage(canvas.toDataURL('image/jpeg', 0.98), 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
            }

            const pdfBuffer = pdf.output('arraybuffer');
            const pdfBlob = new Blob([pdfBuffer], { type: 'application/pdf' });
            if (pdfBlob.size < 1000) throw new Error('Generated PDF is empty');
            return pdfBlob;
        } finally {
            frame.remove();
        }
    };

    const triggerPdfDownload = (pdfBlob, filename) => {
        const downloadUrl = URL.createObjectURL(pdfBlob);
        const downloadLink = document.createElement('a');
        downloadLink.href = downloadUrl;
        downloadLink.download = filename;
        downloadLink.rel = 'noopener';
        downloadLink.style.display = 'none';
        document.body.append(downloadLink);
        downloadLink.click();
        downloadLink.remove();
        window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 60000);
    };

    const downloadPdf = async () => {
        const calculation = calculateLoss();
        if (!calculation) {
            const invalidInput = [employeesInput, hoursInput, salaryInput].find(input => !input.checkValidity());
            invalidInput?.focus();
            return;
        }

        isGeneratingPdf = true;
        downloadButton.disabled = true;
        downloadButton.setAttribute('aria-busy', 'true');
        setDownloadStatus(getSettings().loading);

        try {
            const pdfBlob = await generatePdf(calculation);
            triggerPdfDownload(pdfBlob, getSettings().filename);
            setDownloadStatus(getSettings().success);
        } catch (error) {
            console.error(error);
            setDownloadStatus(getSettings().pdfError);
        } finally {
            isGeneratingPdf = false;
            downloadButton.disabled = false;
            downloadButton.removeAttribute('aria-busy');
        }
    };

    calculator.addEventListener('input', calculateLoss);
    downloadButton.addEventListener('click', downloadPdf);
    window.addEventListener('site-language-change', updateLanguage);

    updateLanguage();
})();
