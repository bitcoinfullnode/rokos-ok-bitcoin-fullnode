/******************************************************************************
 * Copyright © 2013-2015 The Nxt Core Developers.                             *
 *                                                                            *
 * See the AUTHORS.txt, DEVELOPER-AGREEMENT.txt and LICENSE.txt files at      *
 * the top-level directory of this distribution for the individual copyright  *
 * holder information and the developer policies on copyright and licensing.  *
 *                                                                            *
 * Unless otherwise agreed in a custom licensing agreement, no part of the    *
 * Nxt software, including this file, may be copied, modified, propagated,    *
 * or distributed except according to the terms contained in the LICENSE.txt  *
 * file.                                                                      *
 *                                                                            *
 * Removal or modification of this copyright notice is prohibited.            *
 *                                                                            *
 ******************************************************************************/

package nxt.http;

import nxt.Token;
import org.json.simple.JSONObject;
import org.json.simple.JSONStreamAware;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.Part;
import java.io.IOException;

import static nxt.http.JSONResponses.INCORRECT_FILE;
import static nxt.http.JSONResponses.INCORRECT_TOKEN;
import static nxt.http.JSONResponses.MISSING_SECRET_PHRASE;


public final class GenerateFileToken extends APIServlet.APIRequestHandler {

    static final GenerateFileToken instance = new GenerateFileToken();

    private GenerateFileToken() {
        super("file", new APITag[] {APITag.TOKENS}, "secretPhrase");
    }

    @Override
    JSONStreamAware processRequest(HttpServletRequest req) throws ParameterException {
        String secretPhrase = req.getParameter("secretPhrase");
        if (secretPhrase == null) {
            return MISSING_SECRET_PHRASE;
        }
        byte[] data;
        try {
            Part part = req.getPart("file");
            if (part == null) {
                throw new ParameterException(INCORRECT_FILE);
            }
            ParameterParser.FileData fileData = new ParameterParser.FileData(part).invoke();
            data = fileData.getData();
        } catch (IOException | ServletException e) {
            throw new ParameterException(INCORRECT_FILE);
        }
        try {
            String tokenString = Token.generateToken(secretPhrase, data);
            JSONObject response = JSONData.token(Token.parseToken(tokenString, data));
            response.put("token", tokenString);
            return response;
        } catch (RuntimeException e) {
            return INCORRECT_TOKEN;
        }
    }

    @Override
    boolean requirePost() {
        return true;
    }

    @Override
    boolean allowRequiredBlockParameters() {
        return false;
    }

}
