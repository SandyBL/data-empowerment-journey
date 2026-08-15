(() => {
    const calculator = document.getElementById('bad-data-calculator-form');
    const employeesInput = document.getElementById('bad-data-employees');
    const hoursInput = document.getElementById('bad-data-hours');
    const salaryInput = document.getElementById('bad-data-salary');
    const amountOutput = document.getElementById('bad-data-loss-amount');
    const inlineAmounts = document.querySelectorAll('[data-bad-data-inline-loss]');
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
            required: 'Enter a value to calculate the loss.',
            wholeNumber: 'Use a whole number, with no decimals.',
            minValue: 'Enter a number greater than zero.',
            maxEmployees: 'The maximum allowed is 100,000 people.',
            maxHours: 'The maximum allowed is 40 hours per week.',
            maxSalary: 'The maximum allowed is 10,000,000.',
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
            required: 'Introduce un valor para calcular la pérdida.',
            wholeNumber: 'Usa un número entero, sin decimales.',
            minValue: 'Introduce un número mayor que cero.',
            maxEmployees: 'El máximo permitido es de 100.000 personas.',
            maxHours: 'El máximo permitido es de 40 horas por semana.',
            maxSalary: 'El máximo permitido es de 10.000.000.',
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
            required: 'Insira um valor para calcular a perda.',
            wholeNumber: 'Use um número inteiro, sem decimais.',
            minValue: 'Insira um número maior que zero.',
            maxEmployees: 'O máximo permitido é de 100.000 pessoas.',
            maxHours: 'O máximo permitido é de 40 horas por semana.',
            maxSalary: 'O máximo permitido é de 10.000.000.',
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

    const inputs = [employeesInput, hoursInput, salaryInput];
    const maxMessageKey = {
        'bad-data-employees': 'maxEmployees',
        'bad-data-hours': 'maxHours',
        'bad-data-salary': 'maxSalary'
    };

    /**
     * Returns why a field is unusable, in the page language, or '' if it is fine.
     *
     * Every rule the markup declares gets its own sentence. The previous
     * version put one generic line under the whole form, which told a visitor
     * that something among three fields was wrong but not which or why.
     */
    const describeProblem = input => {
        const settings = getSettings();
        const value = input.value.trim();
        const number = Number(value);
        if (!value || Number.isNaN(number)) return settings.required;
        if (!Number.isInteger(number)) return settings.wholeNumber;
        if (number < Number(input.min)) return settings.minValue;
        if (number > Number(input.max)) return settings[maxMessageKey[input.id]];
        return '';
    };

    /** Writes (or clears) one field's message and its aria-invalid state. */
    const showProblem = input => {
        const problem = describeProblem(input);
        const error = document.getElementById(`${input.id}-error`);
        input.setAttribute('aria-invalid', problem ? 'true' : 'false');
        if (error) {
            error.textContent = problem;
            error.hidden = !problem;
        }
        return !problem;
    };

    /** Clears a message that has stopped being true, without raising new ones. */
    const clearResolvedProblem = input => {
        if (input.getAttribute('aria-invalid') === 'true') showProblem(input);
    };

    const calculateLoss = () => {
        const employees = Number(employeesInput.value);
        const weeklyHours = Number(hoursInput.value);
        const salary = Number(salaryInput.value);
        const isValid = inputs.every(input => !describeProblem(input));

        if (!isValid) {
            currentCalculation = null;
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
        // A message already on screen was written in the previous language.
        inputs.forEach(clearResolvedProblem);
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
            // Asking for the report is the visitor committing to the numbers, so
            // this is the moment to state every problem at once and send them to
            // the first one rather than only refusing to download.
            const valid = inputs.map(showProblem);
            inputs[valid.indexOf(false)].focus();
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

    // Typing recomputes the figure and retracts a message that no longer holds,
    // but never raises a new one: "enter a number greater than zero" while the
    // visitor is still on the first digit is noise, not help.
    calculator.addEventListener('input', event => {
        if (inputs.includes(event.target)) clearResolvedProblem(event.target);
        calculateLoss();
    });
    // Leaving a field is the visitor saying they are done with it, so that is
    // when it is fair to tell them the value cannot be used.
    calculator.addEventListener('focusout', event => {
        if (inputs.includes(event.target)) showProblem(event.target);
    });
    downloadButton.addEventListener('click', downloadPdf);
    window.addEventListener('site-language-change', updateLanguage);

    updateLanguage();
})();
