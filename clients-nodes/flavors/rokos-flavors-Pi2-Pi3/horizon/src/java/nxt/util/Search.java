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

package nxt.util;

import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.TokenStream;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.analysis.tokenattributes.CharTermAttribute;
import org.apache.lucene.util.Version;

import java.io.IOException;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.List;

public final class Search {

    private static final Analyzer analyzer = new StandardAnalyzer(Version.LUCENE_30);

    public static String[] parseTags(String tags, int minTagLength, int maxTagLength, int maxTagCount) {
        if (tags.trim().length() == 0) {
            return Convert.EMPTY_STRING;
        }
        List<String> list = new ArrayList<>();
        try (TokenStream stream = analyzer.tokenStream(null, new StringReader(tags))) {
            CharTermAttribute attribute = stream.addAttribute(CharTermAttribute.class);
            String tag;
            while (stream.incrementToken() && list.size() < maxTagCount && (tag = attribute.toString()).length() <= maxTagLength && tag.length() >= minTagLength) {
                if (!list.contains(tag)) {
                    list.add(tag);
                }
            }
        } catch (IOException e) {
            throw new RuntimeException(e.toString(), e);
        }
        return list.toArray(new String[list.size()]);
    }

    private Search() {}

}
